namespace DriveZone.Server.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;

        public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Security Headers
            var headers = context.Response.Headers;

            // Prevent clickjacking attacks
            headers.Add("X-Frame-Options", "DENY");

            // Prevent MIME type sniffing
            headers.Add("X-Content-Type-Options", "nosniff");

            // Enable XSS protection
            headers.Add("X-XSS-Protection", "1; mode=block");

            // Referrer policy
            headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy
            headers.Add("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
                "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
                "img-src 'self' data: https:; " +
                "connect-src 'self' https://api.drivezone.com; " +
                "frame-ancestors 'none'");

            // Permissions Policy (formerly Feature Policy)
            headers.Add("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(self), payment=(self)");

            // HTTP Strict Transport Security (HSTS)
            if (context.Request.IsHttps)
            {
                headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
            }

            // Custom DriveZone headers
            headers.Add("X-DriveZone-API", "v1.0");
            headers.Add("X-DriveZone-Security", "Enhanced");

            // Remove potentially sensitive headers
            headers.Remove("Server");
            headers.Remove("X-Powered-By");
            headers.Remove("X-AspNet-Version");
            headers.Remove("X-AspNetMvc-Version");

            _logger.LogDebug("Security headers applied to request {Path}", context.Request.Path);

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}