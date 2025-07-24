using System.Collections.Concurrent;
using System.Net;

namespace DriveZone.Server.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingOptions _options;

        // In-memory storage for rate limiting (use Redis in production)
        private static readonly ConcurrentDictionary<string, ClientRequestInfo> _clients = new();

        public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, RateLimitingOptions options)
        {
            _next = next;
            _logger = logger;
            _options = options;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientId = GetClientIdentifier(context);
            var endpoint = GetEndpointIdentifier(context);
            var key = $"{clientId}:{endpoint}";

            var clientInfo = _clients.GetOrAdd(key, _ => new ClientRequestInfo());

            lock (clientInfo)
            {
                var now = DateTime.UtcNow;

                // Clean old requests outside the time window
                clientInfo.Requests.RemoveAll(r => now - r > _options.TimeWindow);

                // Check if rate limit exceeded
                if (clientInfo.Requests.Count >= GetRateLimit(context))
                {
                    var oldestRequest = clientInfo.Requests.Min();
                    var resetTime = oldestRequest.Add(_options.TimeWindow);
                    var retryAfter = (int)(resetTime - now).TotalSeconds;

                    context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    context.Response.Headers.Add("Retry-After", retryAfter.ToString());
                    context.Response.Headers.Add("X-RateLimit-Limit", GetRateLimit(context).ToString());
                    context.Response.Headers.Add("X-RateLimit-Remaining", "0");
                    context.Response.Headers.Add("X-RateLimit-Reset", ((DateTimeOffset)resetTime).ToUnixTimeSeconds().ToString());

                    _logger.LogWarning("Rate limit exceeded for client {ClientId} on endpoint {Endpoint}. Requests: {RequestCount}, Limit: {RateLimit}",
                        clientId, endpoint, clientInfo.Requests.Count, GetRateLimit(context));

                    await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
                    return;
                }

                // Add current request
                clientInfo.Requests.Add(now);

                // Add rate limit headers
                var remaining = GetRateLimit(context) - clientInfo.Requests.Count;
                context.Response.Headers.Add("X-RateLimit-Limit", GetRateLimit(context).ToString());
                context.Response.Headers.Add("X-RateLimit-Remaining", Math.Max(0, remaining).ToString());

                if (clientInfo.Requests.Count > 0)
                {
                    var oldestRequest = clientInfo.Requests.Min();
                    var resetTime = oldestRequest.Add(_options.TimeWindow);
                    context.Response.Headers.Add("X-RateLimit-Reset", ((DateTimeOffset)resetTime).ToUnixTimeSeconds().ToString());
                }
            }

            await _next(context);
        }

        private static string GetClientIdentifier(HttpContext context)
        {
            // Try to get user ID first (for authenticated requests)
            var userId = context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user:{userId}";
            }

            // Fall back to IP address
            var request = context.Request;
            var forwardedFor = request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return $"ip:{forwardedFor.Split(',')[0].Trim()}";
            }

            var realIP = request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIP))
            {
                return $"ip:{realIP}";
            }

            return $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
        }

        private static string GetEndpointIdentifier(HttpContext context)
        {
            var request = context.Request;
            return $"{request.Method}:{request.Path}";
        }

        private int GetRateLimit(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";
            var method = context.Request.Method.ToUpper();

            // Strict limits for authentication endpoints
            if (path.Contains("/api/auth/login") || path.Contains("/api/auth/register"))
            {
                return _options.AuthenticationLimit;
            }

            // Stricter limits for payment processing
            if (path.Contains("/api/payment"))
            {
                return _options.PaymentLimit;
            }

            // More lenient for read operations
            if (method == "GET")
            {
                return _options.ReadLimit;
            }

            // Standard limit for other operations
            return _options.StandardLimit;
        }

        // Cleanup old entries periodically
        public static void CleanupOldEntries()
        {
            var cutoff = DateTime.UtcNow.AddHours(-1);
            var keysToRemove = new List<string>();

            foreach (var kvp in _clients)
            {
                lock (kvp.Value)
                {
                    kvp.Value.Requests.RemoveAll(r => r < cutoff);
                    if (kvp.Value.Requests.Count == 0)
                    {
                        keysToRemove.Add(kvp.Key);
                    }
                }
            }

            foreach (var key in keysToRemove)
            {
                _clients.TryRemove(key, out _);
            }
        }
    }

    public class ClientRequestInfo
    {
        public List<DateTime> Requests { get; set; } = new();
    }

    public class RateLimitingOptions
    {
        public TimeSpan TimeWindow { get; set; } = TimeSpan.FromMinutes(1);
        public int StandardLimit { get; set; } = 100; // 100 requests per minute
        public int ReadLimit { get; set; } = 200; // 200 GET requests per minute
        public int AuthenticationLimit { get; set; } = 10; // 10 auth attempts per minute
        public int PaymentLimit { get; set; } = 5; // 5 payment requests per minute
    }

    public static class RateLimitingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder, RateLimitingOptions? options = null)
        {
            options ??= new RateLimitingOptions();
            return builder.UseMiddleware<RateLimitingMiddleware>(options);
        }
    }
}