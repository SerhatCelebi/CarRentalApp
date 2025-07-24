# 🔧 DriveZone Configuration Guide

Bu dokümantasyon DriveZone platformunun tüm konfigürasyon ayarlarını detaylıca açıklar.

## 📋 İçindekiler

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Authentication & Authorization](#authentication--authorization)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Docker Configuration](#docker-configuration)
- [Troubleshooting](#troubleshooting)

## 🌐 Environment Variables

### Backend Environment Variables

#### Required Variables

```env
# Database Connection
DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;TrustServerCertificate=true;

# JWT Configuration
JWT_SECRET=DriveZoneSecretKey2024!VerySecureKeyForProduction
JWT_ISSUER=DriveZone
JWT_AUDIENCE=DriveZoneUsers
JWT_EXPIRATION_DAYS=30
```

#### Optional Variables

```env
# Application Settings
DRIVEZONE_SUPPORT_EMAIL=support@drivezone.com
DRIVEZONE_COMPANY_NAME=DriveZone Platform
DRIVEZONE_CURRENCY=TRY
DRIVEZONE_LOCATION=TR
DRIVEZONE_MAX_BOOKING_DURATION=30
DRIVEZONE_MIN_BOOKING_DURATION=1

# Logging
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7042;http://localhost:5042
LOG_LEVEL=Information
ENABLE_SWAGGER=true

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_SSL=true

# External API Keys (Optional)
PAYMENT_GATEWAY_API_KEY=your-payment-api-key
MAPS_API_KEY=your-maps-api-key
SMS_API_KEY=your-sms-api-key
```

### Frontend Environment Variables

Frontend ortam değişkenleri `vite.config.js` ile yönetilir:

```javascript
// Environment variables
define: {
  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  __APP_NAME__: JSON.stringify("DriveZone"),
},
```

## 🗄 Database Configuration

### Connection Strings

#### Development (LocalDB)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

#### Development (SQL Server Express)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=DriveZoneDB;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

#### Production

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-production-server;Database=DriveZoneDB;User Id=prod-user;Password=strong-password;TrustServerCertificate=true;"
  }
}
```

#### Docker

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=drivezone-db;Database=DriveZoneDB;User Id=sa;Password=DriveZone2024!Secure;TrustServerCertificate=true;"
  }
}
```

### Migration Commands

```bash
# Add new migration
dotnet ef migrations add MigrationName --project DriveZone.Server

# Update database
dotnet ef database update --project DriveZone.Server

# Remove last migration
dotnet ef migrations remove --project DriveZone.Server

# Generate SQL script
dotnet ef migrations script --project DriveZone.Server
```

## 🔐 Authentication & Authorization

### JWT Configuration

```json
{
  "JWT": {
    "Secret": "DriveZoneSecretKey2024!VerySecureKeyForProduction",
    "Issuer": "DriveZone",
    "Audience": "DriveZoneUsers",
    "ExpirationInDays": 30
  }
}
```

### Identity Configuration

```csharp
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
```

### Role Configuration

Default roles:

- **Admin**: Full system access
- **Member**: Customer access

## 🔨 Development Setup

### 1. Prerequisites

```bash
# .NET SDK kontrol edin
dotnet --version  # 8.0 veya üzeri

# Node.js kontrol edin
node --version    # 18.0 veya üzeri
npm --version
```

### 2. Database Migration

```bash
cd DriveZone.Server
dotnet ef migrations add InitialMigration
dotnet ef database update
```

### 3. Seed Data (Opsiyonel)

İlk çalıştırmada otomatik olarak roller oluşturulur:

- Admin
- Member

Admin kullanıcısı için manuel olarak rol ataması yapılmalıdır.

### 4. Development Servers

**Backend:**

```bash
cd DriveZone.Server
dotnet run
# https://localhost:7042
```

**Frontend:**

```bash
cd drivezone.client
npm install
npm run dev
# http://localhost:3000
```

## 🚀 Production Setup

### 1. Environment Variables

```env
# Production Database
DefaultConnection=Server=your-production-server;Database=DriveZoneDB;User Id=prod-user;Password=strong-password;TrustServerCertificate=true;

# Security
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://localhost:443;http://localhost:80

# Logging
LOG_LEVEL=Warning
ENABLE_SWAGGER=false
```

### 2. SSL Certificate

```bash
# Development SSL certificate
dotnet dev-certs https --trust
```

### 3. Build Commands

**Backend:**

```bash
cd DriveZone.Server
dotnet publish -c Release -o ./publish
```

**Frontend:**

```bash
cd drivezone.client
npm run build
```

## 🐳 Docker Configuration

### 1. Development Docker Compose

```yaml
version: "3.8"

services:
  drivezone-api:
    build:
      context: .
      dockerfile: DriveZone.Server/Dockerfile
    ports:
      - "7042:443"
      - "5042:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - DefaultConnection=Server=drivezone-db;Database=DriveZoneDB;User Id=sa;Password=DriveZone2024!Secure;TrustServerCertificate=true;
    depends_on:
      - drivezone-db
    volumes:
      - ~/.aspnet/https:/https:ro

  drivezone-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=DriveZone2024!Secure
    ports:
      - "1433:1433"
    volumes:
      - drivezone_data:/var/opt/mssql

volumes:
  drivezone_data:
```

### 2. Docker Commands

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

# Sadece backend
docker build -t drivezone-api ./DriveZone.Server
docker run -p 7042:443 drivezone-api
```

## ⚙️ Configuration Files

### appsettings.json (Backend)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;"
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": "Information",
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/app-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  }
}
```

### vite.config.js (Frontend)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@utils": "/src/utils",
      "@styles": "/src/styles",
      "@assets": "/src/assets",
    },
  },
  server: {
    proxy: {
      "^/api": {
        target: "https://localhost:7042",
        changeOrigin: true,
        secure: false,
      },
    },
    port: 3000,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["bootstrap"],
        },
      },
    },
  },
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```bash
   # Connection string'i kontrol edin
   # SQL Server'ın çalıştığından emin olun
   dotnet ef database update
   ```

2. **CORS Error**

   ```csharp
   // Program.cs'de CORS policy kontrol edin
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("DriveZonePolicy",
           builder => builder.WithOrigins("http://localhost:3000")
                             .AllowAnyMethod()
                             .AllowAnyHeader()
                             .AllowCredentials());
   });
   ```

3. **Port Conflicts**

   ```bash
   # Kullanılan portları kontrol edin
   netstat -ano | findstr :7042

   # Port değiştirmek için launchSettings.json düzenleyin
   ```

4. **SSL Certificate Issues**
   ```bash
   # Development SSL certificate yenileyin
   dotnet dev-certs https --clean
   dotnet dev-certs https --trust
   ```

### Environment-Specific Configurations

#### Development

- Detailed error messages enabled
- Swagger UI enabled
- Console logging enabled
- LocalDB or SQL Express

#### Staging

- Limited error details
- File logging enabled
- External SQL Server
- HTTPS enforced

#### Production

- Minimal error exposure
- Structured logging
- Performance optimizations
- Security headers enabled

## 🚀 Performance Optimization

### Backend Performance

```json
{
  "DriveZone": {
    "ConnectionPooling": true,
    "MaxRetryCount": 3,
    "CommandTimeout": 30,
    "EnableSensitiveDataLogging": false,
    "CacheTimeout": 300
  }
}
```

### Frontend Performance

```javascript
// Vite Build Optimization
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        router: ["react-router-dom"],
        ui: ["bootstrap", "react-bootstrap"],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

## 🔐 Security Configuration

### Security Headers Middleware

```csharp
app.UseSecurityHeaders();  // Custom middleware
app.UseRequestLogging();   // Request logging
app.UseRateLimiting();     // Rate limiting
app.UseErrorHandling();    // Global error handling
```

### CORS Policy

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("DriveZonePolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://drivezone.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

## 📊 Monitoring & Logging

### Serilog Configuration

```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning",
        "Microsoft.EntityFrameworkCore.Database.Command": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/drivezone-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}
```

### Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<DriveZoneContext>("database")
    .AddCheck("self", () => HealthCheckResult.Healthy());
```

## 🎛 Advanced Configuration

### Custom DriveZone Settings

```json
{
  "DriveZone": {
    "ApplicationName": "DriveZone Premium Vehicle Rental Platform",
    "Version": "1.0.0",
    "Environment": "Development",
    "SupportEmail": "support@drivezone.com",
    "CompanyName": "DriveZone Platform",
    "DefaultCurrency": "TRY",
    "DefaultLocation": "TR",
    "MaxBookingDuration": 30,
    "MinBookingDuration": 1,
    "CancellationPolicy": {
      "AdminCancellationHours": 0,
      "MemberCancellationHours": 24,
      "ModificationHours": 48
    },
    "LoyaltyProgram": {
      "PointsPerAmount": 0.1,
      "BronzeThreshold": 0,
      "SilverThreshold": 2000,
      "GoldThreshold": 5000,
      "PlatinumThreshold": 10000
    }
  }
}
```

### Custom Middleware Configuration

```csharp
// Custom middleware order
app.UseErrorHandling();     // Global exception handling
app.UseSecurityHeaders();   // Security headers
app.UseRequestLogging();    // Request/response logging
app.UseRateLimiting();      // Rate limiting

// Standard middleware
app.UseHttpsRedirection();
app.UseCors("DriveZonePolicy");
app.UseAuthentication();
app.UseAuthorization();
```

---

Bu konfigürasyon dokümanı DriveZone platformunun tüm ayarlarını kapsar. Sorularınız için [support@drivezone.com](mailto:support@drivezone.com) adresine ulaşabilirsiniz.
