using DriveZone.Server.Data;
using DriveZone.Server.Data.Repositories;
using DriveZone.Server.Data.Repositories.IRepositories;
using DriveZone.Server.Models;
using DriveZone.Server.Services;
using DriveZone.Server.Services.IServices;
using DriveZone.Server.Middleware;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

namespace DriveZone.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load environment variables
            Env.Load();

            // CORS Configuration for DriveZone
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("DriveZonePolicy", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "https://drivezone.com", "https://www.drivezone.com")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            // Configure Entity Framework Core with SQL Server for DriveZone
            var connectionString = Environment.GetEnvironmentVariable("DefaultConnection") ??
                                 builder.Configuration.GetConnectionString("DefaultConnection") ??
                                 "Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;TrustServerCertificate=true;";

            builder.Services.AddDbContext<DriveZoneContext>(options =>
                options.UseSqlServer(connectionString));

            // Configure JWT Authentication
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ??
                           builder.Configuration["JWT:Secret"] ??
                           "DriveZoneSecretKey2024!VerySecureKeyForProduction";

            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ??
                           builder.Configuration["JWT:Issuer"] ??
                           "DriveZone";

            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ??
                             builder.Configuration["JWT:Audience"] ??
                             "DriveZoneUsers";

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    ClockSkew = TimeSpan.Zero
                };

                // Add JWT events for better error handling
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            // Configure Identity for DriveZone Members
            builder.Services.AddIdentity<Member, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
                options.Password.RequiredUniqueChars = 1;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedAccount = false;
            })
            .AddEntityFrameworkStores<DriveZoneContext>()
            .AddDefaultTokenProviders();

            // Configure authorization policies for DriveZone
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("Member", policy =>
                    policy.RequireRole("Member"));
                options.AddPolicy("Admin", policy =>
                    policy.RequireRole("Admin"));
                options.AddPolicy("VipMember", policy =>
                    policy.RequireRole("Member")
                          .RequireClaim("MembershipLevel", "Gold", "Platinum"));
            });

            // Setup Serilog for DriveZone
            var logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .Enrich.WithProperty("Application", "DriveZone.API")
                .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
                .Enrich.WithMachineName()
                .Enrich.WithThreadId()
                .CreateLogger();

            builder.Host.UseSerilog(logger);

            // DriveZone Services Registration
            builder.Services.AddScoped<IMemberService, MemberService>();
            builder.Services.AddScoped<IVehicleService, VehicleService>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped<IEmailService, EmailService>();

            // DriveZone Repositories Registration
            builder.Services.AddScoped<IMemberRepository, MemberRepository>();
            builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
            builder.Services.AddScoped<IBookingRepository, BookingRepository>();

            // Add controllers and API documentation
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep PascalCase
                    options.JsonSerializerOptions.WriteIndented = true;
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddHttpContextAccessor();

            // Swagger Configuration for DriveZone API
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new()
                {
                    Title = "DriveZone API",
                    Version = "v1.0",
                    Description = "Premium Vehicle Rental Platform API - Comprehensive vehicle booking and management system for Turkish market",
                    Contact = new()
                    {
                        Name = "DriveZone Technical Support",
                        Email = "tech-support@drivezone.com",
                        Url = new Uri("https://drivezone.com/support")
                    },
                    License = new()
                    {
                        Name = "DriveZone API License",
                        Url = new Uri("https://drivezone.com/api-license")
                    }
                });

                // Add JWT Authentication to Swagger
                c.AddSecurityDefinition("Bearer", new()
                {
                    Description = @"JWT Authorization header using the Bearer scheme. 
                                  Enter 'Bearer' [space] and then your token in the text input below.
                                  Example: 'Bearer 12345abcdef'",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new()
                {
                    {
                        new()
                        {
                            Reference = new()
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // Include XML comments if available
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }
            });

            // Add health checks
            builder.Services.AddHealthChecks()
                .AddDbContextCheck<DriveZoneContext>("database")
                .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

            // Add memory cache
            builder.Services.AddMemoryCache();

            var app = builder.Build();

            // Configure the HTTP request pipeline for DriveZone

            // Global exception handling (should be first)
            app.UseErrorHandling();

            // Security headers
            app.UseSecurityHeaders();

            // Request logging
            app.UseRequestLogging();

            // Rate limiting
            app.UseRateLimiting();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DriveZone API v1.0");
                    c.RoutePrefix = "swagger";
                    c.DocumentTitle = "DriveZone API Documentation";
                    c.DefaultModelsExpandDepth(-1);
                    c.EnableDeepLinking();
                    c.EnableFilter();
                    c.ShowExtensions();
                });
            }

            // Seed DriveZone roles and default data
            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var context = scope.ServiceProvider.GetRequiredService<DriveZoneContext>();

                    // Apply migrations in production, create database in development
                    if (app.Environment.IsDevelopment())
                    {
                        context.Database.EnsureCreated();
                    }
                    else
                    {
                        context.Database.Migrate();
                    }

                    var memberService = scope.ServiceProvider.GetRequiredService<IMemberService>();
                    await memberService.SeedRolesAsync();

                    logger.Information("DriveZone application started successfully - Database initialized");
                }
                catch (Exception ex)
                {
                    logger.Error(ex, "Error during DriveZone application startup - Database initialization failed");
                    throw; // Re-throw to prevent app from starting with broken state
                }
            }

            app.UseHttpsRedirection();
            app.UseCors("DriveZonePolicy");
            app.UseAuthentication();
            app.UseAuthorization();

            // Add health check endpoints
            app.MapHealthChecks("/health", new()
            {
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var result = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        status = report.Status.ToString(),
                        checks = report.Entries.Select(entry => new
                        {
                            name = entry.Key,
                            status = entry.Value.Status.ToString(),
                            exception = entry.Value.Exception?.Message,
                            duration = entry.Value.Duration.TotalMilliseconds
                        }),
                        totalDuration = report.TotalDuration.TotalMilliseconds
                    });
                    await context.Response.WriteAsync(result);
                }
            });

            app.MapControllers();
            app.MapFallbackToFile("/index.html");

            // Start cleanup tasks
            var cancellationToken = new CancellationTokenSource();
            _ = Task.Run(async () =>
            {
                while (!cancellationToken.Token.IsCancellationRequested)
                {
                    RateLimitingMiddleware.CleanupOldEntries();
                    await Task.Delay(TimeSpan.FromMinutes(10), cancellationToken.Token);
                }
            }, cancellationToken.Token);

            logger.Information("DriveZone API is starting up...");

            app.Run();
        }
    }
}