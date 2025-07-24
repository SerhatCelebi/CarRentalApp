using DriveZone.Server.Models.ResultModel;
using System.Net;
using System.Text.Json;

namespace DriveZone.Server.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred while processing request {RequestPath}", context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var requestId = context.Items["RequestId"]?.ToString() ?? Guid.NewGuid().ToString("N")[..8];

            var errorResponse = exception switch
            {
                UnauthorizedAccessException => CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "Unauthorized access",
                    "You don't have permission to access this resource",
                    requestId),

                ArgumentException argEx => CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "Invalid argument",
                    argEx.Message,
                    requestId),

                KeyNotFoundException => CreateErrorResponse(
                    HttpStatusCode.NotFound,
                    "Resource not found",
                    "The requested resource could not be found",
                    requestId),

                InvalidOperationException invalidOpEx => CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "Invalid operation",
                    invalidOpEx.Message,
                    requestId),

                TimeoutException => CreateErrorResponse(
                    HttpStatusCode.RequestTimeout,
                    "Request timeout",
                    "The request took too long to process",
                    requestId),

                _ => CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    "Internal server error",
                    _environment.IsDevelopment() ? exception.Message : "An unexpected error occurred",
                    requestId,
                    _environment.IsDevelopment() ? exception.StackTrace : null)
            };

            context.Response.StatusCode = (int)errorResponse.StatusCode;
            context.Response.ContentType = "application/json";

            var jsonResponse = JsonSerializer.Serialize(errorResponse.Body, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        private static ErrorResponse CreateErrorResponse(
            HttpStatusCode statusCode,
            string title,
            string detail,
            string requestId,
            string? stackTrace = null)
        {
            var errorBody = new
            {
                success = false,
                error = new
                {
                    title,
                    detail,
                    statusCode = (int)statusCode,
                    timestamp = DateTime.UtcNow,
                    requestId,
                    stackTrace = stackTrace
                },
                supportInfo = new
                {
                    message = "If this error persists, please contact our support team",
                    email = "support@drivezone.com",
                    documentation = "https://api.drivezone.com/docs"
                }
            };

            return new ErrorResponse
            {
                StatusCode = statusCode,
                Body = errorBody
            };
        }

        private class ErrorResponse
        {
            public HttpStatusCode StatusCode { get; set; }
            public object Body { get; set; } = new();
        }
    }

    public static class ErrorHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ErrorHandlingMiddleware>();
        }
    }
}