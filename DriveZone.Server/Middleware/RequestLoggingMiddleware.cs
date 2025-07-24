using System.Diagnostics;
using System.Text;

namespace DriveZone.Server.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestId = Guid.NewGuid().ToString("N")[..8];

            // Add request ID to context for tracking
            context.Items["RequestId"] = requestId;

            // Log request details
            var request = context.Request;
            var requestInfo = new
            {
                RequestId = requestId,
                Method = request.Method,
                Path = request.Path.Value,
                QueryString = request.QueryString.Value,
                UserAgent = request.Headers["User-Agent"].FirstOrDefault(),
                RemoteIP = GetClientIP(context),
                UserId = context.User?.Identity?.Name,
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Request {RequestId} started: {Method} {Path}{QueryString} from {RemoteIP}",
                requestId, requestInfo.Method, requestInfo.Path, requestInfo.QueryString, requestInfo.RemoteIP);

            // Capture request body for POST/PUT requests (if not file upload)
            string requestBody = string.Empty;
            if (ShouldLogRequestBody(request))
            {
                requestBody = await ReadRequestBodyAsync(request);
                if (!string.IsNullOrEmpty(requestBody))
                {
                    _logger.LogDebug("Request {RequestId} body: {RequestBody}", requestId,
                        SanitizeRequestBody(requestBody));
                }
            }

            // Capture original response body stream
            var originalBodyStream = context.Response.Body;

            try
            {
                using var responseBodyStream = new MemoryStream();
                context.Response.Body = responseBodyStream;

                await _next(context);

                stopwatch.Stop();

                // Log response details
                var response = context.Response;
                var responseInfo = new
                {
                    RequestId = requestId,
                    StatusCode = response.StatusCode,
                    Duration = stopwatch.ElapsedMilliseconds,
                    ResponseSize = responseBodyStream.Length
                };

                var logLevel = GetLogLevel(response.StatusCode);
                _logger.Log(logLevel,
                    "Request {RequestId} completed: {StatusCode} in {Duration}ms ({ResponseSize} bytes)",
                    requestId, responseInfo.StatusCode, responseInfo.Duration, responseInfo.ResponseSize);

                // Log response body for errors
                if (response.StatusCode >= 400 && responseBodyStream.Length > 0)
                {
                    responseBodyStream.Seek(0, SeekOrigin.Begin);
                    var responseBody = await new StreamReader(responseBodyStream).ReadToEndAsync();
                    _logger.LogWarning("Request {RequestId} error response: {ResponseBody}",
                        requestId, responseBody);
                }

                // Copy response back to original stream
                responseBodyStream.Seek(0, SeekOrigin.Begin);
                await responseBodyStream.CopyToAsync(originalBodyStream);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "Request {RequestId} failed after {Duration}ms: {Error}",
                    requestId, stopwatch.ElapsedMilliseconds, ex.Message);
                throw;
            }
            finally
            {
                context.Response.Body = originalBodyStream;
            }
        }

        private static string GetClientIP(HttpContext context)
        {
            var request = context.Request;

            // Check for forwarded IP first (behind proxy/load balancer)
            var forwardedFor = request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            var realIP = request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIP))
            {
                return realIP;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private static bool ShouldLogRequestBody(HttpRequest request)
        {
            // Don't log request body for GET requests or file uploads
            if (request.Method == "GET" || request.Method == "DELETE")
                return false;

            var contentType = request.ContentType?.ToLower();
            if (contentType == null)
                return false;

            // Skip file uploads and large payloads
            if (contentType.Contains("multipart/form-data") ||
                contentType.Contains("application/octet-stream") ||
                contentType.Contains("image/") ||
                contentType.Contains("video/") ||
                contentType.Contains("audio/"))
                return false;

            // Only log JSON and form data
            return contentType.Contains("application/json") ||
                   contentType.Contains("application/x-www-form-urlencoded");
        }

        private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            if (request.ContentLength == null || request.ContentLength == 0)
                return string.Empty;

            // Limit body size to prevent memory issues
            const int maxBodySize = 10 * 1024; // 10KB
            if (request.ContentLength > maxBodySize)
                return $"[Body too large: {request.ContentLength} bytes]";

            request.EnableBuffering();
            request.Body.Position = 0;

            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();

            request.Body.Position = 0;
            return body;
        }

        private static string SanitizeRequestBody(string body)
        {
            if (string.IsNullOrEmpty(body))
                return body;

            // Remove sensitive information from logs
            var sensitiveFields = new[] { "password", "cvv", "cardNumber", "ssn", "nationalId" };

            foreach (var field in sensitiveFields)
            {
                // Simple regex to mask sensitive fields in JSON
                body = System.Text.RegularExpressions.Regex.Replace(body,
                    $@"""{field}"":\s*""[^""]*""",
                    $@"""{field}"": ""***""",
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            }

            return body;
        }

        private static LogLevel GetLogLevel(int statusCode)
        {
            return statusCode switch
            {
                >= 500 => LogLevel.Error,
                >= 400 => LogLevel.Warning,
                >= 300 => LogLevel.Information,
                _ => LogLevel.Information
            };
        }
    }

    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}