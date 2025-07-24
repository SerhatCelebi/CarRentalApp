using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Reflection;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class HealthController : ControllerBase
    {
        private readonly HealthCheckService _healthCheckService;
        private readonly ILogger<HealthController> _logger;

        public HealthController(HealthCheckService healthCheckService, ILogger<HealthController> logger)
        {
            _healthCheckService = healthCheckService;
            _logger = logger;
        }

        /// <summary>
        /// Basic health check endpoint
        /// </summary>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                service = "DriveZone API",
                version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0"
            });
        }

        /// <summary>
        /// Detailed health check with all dependencies
        /// </summary>
        [HttpGet("detailed")]
        public async Task<IActionResult> GetDetailed()
        {
            try
            {
                var healthReport = await _healthCheckService.CheckHealthAsync();

                var response = new
                {
                    status = healthReport.Status.ToString(),
                    totalDuration = healthReport.TotalDuration.TotalMilliseconds,
                    timestamp = DateTime.UtcNow,
                    service = "DriveZone API",
                    version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    checks = healthReport.Entries.Select(entry => new
                    {
                        name = entry.Key,
                        status = entry.Value.Status.ToString(),
                        duration = entry.Value.Duration.TotalMilliseconds,
                        description = entry.Value.Description,
                        data = entry.Value.Data.Count > 0 ? entry.Value.Data : null,
                        tags = entry.Value.Tags.Count > 0 ? entry.Value.Tags : null
                    }),
                    environment = new
                    {
                        machineName = Environment.MachineName,
                        osVersion = Environment.OSVersion.ToString(),
                        framework = Environment.Version.ToString(),
                        workingSet = Environment.WorkingSet,
                        gcMemory = GC.GetTotalMemory(false)
                    }
                };

                var statusCode = healthReport.Status switch
                {
                    HealthStatus.Healthy => 200,
                    HealthStatus.Degraded => 200,
                    HealthStatus.Unhealthy => 503,
                    _ => 500
                };

                return StatusCode(statusCode, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during health check");

                return StatusCode(503, new
                {
                    status = "Unhealthy",
                    timestamp = DateTime.UtcNow,
                    error = "Health check failed",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Live readiness probe for Kubernetes
        /// </summary>
        [HttpGet("ready")]
        public async Task<IActionResult> Ready()
        {
            try
            {
                var healthReport = await _healthCheckService.CheckHealthAsync();

                if (healthReport.Status == HealthStatus.Healthy)
                {
                    return Ok(new { status = "Ready", timestamp = DateTime.UtcNow });
                }

                return StatusCode(503, new
                {
                    status = "Not Ready",
                    timestamp = DateTime.UtcNow,
                    reason = "One or more health checks failed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during readiness check");
                return StatusCode(503, new
                {
                    status = "Not Ready",
                    timestamp = DateTime.UtcNow,
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Liveness probe for Kubernetes
        /// </summary>
        [HttpGet("live")]
        public IActionResult Live()
        {
            return Ok(new
            {
                status = "Live",
                timestamp = DateTime.UtcNow,
                uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()
            });
        }

        /// <summary>
        /// Get system information
        /// </summary>
        [HttpGet("info")]
        public IActionResult GetSystemInfo()
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var process = System.Diagnostics.Process.GetCurrentProcess();

                var systemInfo = new
                {
                    application = new
                    {
                        name = "DriveZone API",
                        version = assembly.GetName().Version?.ToString() ?? "1.0.0",
                        buildDate = System.IO.File.GetCreationTime(assembly.Location).ToString("yyyy-MM-dd HH:mm:ss UTC"),
                        environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
                    },
                    system = new
                    {
                        machineName = Environment.MachineName,
                        userName = Environment.UserName,
                        osVersion = Environment.OSVersion.ToString(),
                        is64BitProcess = Environment.Is64BitProcess,
                        processorCount = Environment.ProcessorCount,
                        clrVersion = Environment.Version.ToString(),
                        workingSet = $"{Environment.WorkingSet / 1024 / 1024} MB",
                        gcMemory = $"{GC.GetTotalMemory(false) / 1024 / 1024} MB"
                    },
                    process = new
                    {
                        id = process.Id,
                        name = process.ProcessName,
                        startTime = process.StartTime.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC"),
                        uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime(),
                        threads = process.Threads.Count,
                        handles = process.HandleCount
                    }
                };

                return Ok(systemInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system information");
                return StatusCode(500, new { error = "Failed to retrieve system information" });
            }
        }

        /// <summary>
        /// Get API endpoints information
        /// </summary>
        [HttpGet("endpoints")]
        public IActionResult GetEndpoints()
        {
            try
            {
                var endpoints = new
                {
                    health = new
                    {
                        basic = "/api/health",
                        detailed = "/api/health/detailed",
                        ready = "/api/health/ready",
                        live = "/api/health/live",
                        info = "/api/health/info",
                        endpoints = "/api/health/endpoints"
                    },
                    auth = new
                    {
                        register = "/api/auth/register",
                        login = "/api/auth/login",
                        logout = "/api/auth/logout",
                        refresh = "/api/auth/refresh",
                        changePassword = "/api/auth/change-password",
                        forgotPassword = "/api/auth/forgot-password",
                        resetPassword = "/api/auth/reset-password",
                        profile = "/api/auth/profile"
                    },
                    member = new
                    {
                        profile = "/api/member/profile",
                        updateProfile = "/api/member/profile",
                        bookings = "/api/member/bookings",
                        loyaltyPoints = "/api/member/loyalty-points"
                    },
                    vehicle = new
                    {
                        getAll = "/api/vehicle",
                        getById = "/api/vehicle/{id}",
                        search = "/api/vehicle/search",
                        available = "/api/vehicle/available",
                        add = "/api/vehicle (Admin only)",
                        update = "/api/vehicle/{id} (Admin only)",
                        delete = "/api/vehicle/{id} (Admin only)"
                    },
                    booking = new
                    {
                        create = "/api/booking",
                        getById = "/api/booking/{id}",
                        update = "/api/booking/{id}",
                        cancel = "/api/booking/{id}/cancel",
                        calculateCost = "/api/booking/calculate-cost"
                    },
                    payment = new
                    {
                        process = "/api/payment/process",
                        history = "/api/payment/history",
                        receipt = "/api/payment/receipt/{transactionId}",
                        refund = "/api/payment/refund",
                        methods = "/api/payment/methods"
                    },
                    admin = new
                    {
                        dashboard = "/api/admin/dashboard",
                        members = "/api/admin/members",
                        vehicles = "/api/admin/vehicles",
                        bookings = "/api/admin/bookings",
                        reports = "/api/admin/reports",
                        export = "/api/admin/export/{dataType}"
                    }
                };

                return Ok(new
                {
                    timestamp = DateTime.UtcNow,
                    totalEndpoints = CountEndpoints(endpoints),
                    endpoints
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting endpoints information");
                return StatusCode(500, new { error = "Failed to retrieve endpoints information" });
            }
        }

        private static int CountEndpoints(object obj)
        {
            int count = 0;
            var properties = obj.GetType().GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(obj);
                if (value != null)
                {
                    var nestedProperties = value.GetType().GetProperties();
                    count += nestedProperties.Length;
                }
            }

            return count;
        }
    }
}