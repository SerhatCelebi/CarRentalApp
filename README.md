# 🚗 DriveZone - Premium Vehicle Rental Platform

<div align="center">

![DriveZone Logo](https://via.placeholder.com/200x80/667eea/ffffff?text=DriveZone)

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.6-7952B3?logo=bootstrap)](https://getbootstrap.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Enterprise-level vehicle rental platform with modern architecture and premium user experience**

[🌟 Live Demo](https://drivezone-demo.com) · [📚 Documentation](docs/) · [🐛 Bug Reports](issues/) · [💡 Feature Requests](issues/)

</div>

---

## 🌟 Özellikler

### 🎯 Core Platform Features

- **🚙 Advanced Vehicle Management**: Premium araç filosu yönetimi
- **📅 Smart Booking System**: AI destekli rezervasyon motoru
- **👤 Membership Tiers**: Bronze, Silver, Gold, Platinum seviyeli üyelik
- **💳 Payment Integration**: Güvenli ödeme gateway entegrasyonu
- **🛡️ Comprehensive Insurance**: Temel, Premium, Comprehensive sigorta
- **📱 Modern UI/UX**: Responsive design + PWA ready
- **🔐 Enterprise Security**: JWT + Role-based authorization
- **📊 Advanced Analytics**: Business intelligence dashboard

### 💎 Premium Features

- **VIP Member Services**: Concierge hizmeti + özel araç erişimi
- **Loyalty Program**: Puan kazanma + tier-based avantajlar
- **Dynamic Pricing**: Sezon ve talep bazlı fiyatlandırma
- **Fleet Maintenance**: Predictive maintenance + IoT entegrasyonu
- **Multi-location**: Çoklu şehir + havalimanı entegrasyonu
- **7/24 Support**: Gerçek zamanlı müşteri desteği

## 📱 Screenshots

<div align="center">
  
| Home Page | Vehicle Booking | Admin Dashboard |
|-----------|-----------------|-----------------|
| ![Home](screenshots/home.png) | ![Booking](screenshots/booking.png) | ![Admin](screenshots/admin.png) |

</div>

## 🛠 Teknoloji Stack

### Backend

- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: SQL Server + Entity Framework Core 8.0
- **Authentication**: ASP.NET Core Identity + JWT Bearer
- **Logging**: Serilog (Console + File)
- **Architecture**: Repository Pattern + Service Layer
- **Container**: Docker support

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite 6.2
- **UI Framework**: Bootstrap 5.3.6 + Tailwind CSS 4
- **HTTP Client**: Axios 1.9
- **Routing**: React Router DOM 7.6
- **Icons**: React Icons 5.5
- **State Management**: React Context API

### DevOps & Tools

- **Containerization**: Docker + Docker Compose
- **IDE**: Visual Studio / VS Code support
- **Package Manager**: npm, NuGet
- **Version Control**: Git

## 🏗 Mimari

```
DriveZone/
├── DriveZone.Server/                   # Premium Backend API
│   ├── Controllers/                    # RESTful API Controllers
│   │   ├── MemberController.cs         # Member Management
│   │   ├── VehicleController.cs        # Vehicle Operations
│   │   └── BookingController.cs        # Booking System
│   ├── Services/                       # Business Logic Layer
│   │   ├── MemberService.cs            # Member Operations
│   │   ├── VehicleService.cs           # Vehicle Management
│   │   └── BookingService.cs           # Booking Engine
│   ├── Data/                          # Data Access Layer
│   │   ├── DriveZoneContext.cs         # EF Core Context
│   │   └── Repositories/              # Repository Pattern
│   ├── Models/                        # Domain Models
│   │   ├── Vehicle.cs                 # Vehicle Entity
│   │   ├── Booking.cs                 # Booking Entity
│   │   ├── Member.cs                  # Member Entity
│   │   ├── Enums/                     # Business Enums
│   │   └── DTOs/                      # Data Transfer Objects
│   └── Migrations/                    # Database Migrations
├── drivezone.client/                  # Premium Frontend SPA
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   ├── pages/                   # Page Components
│   │   ├── services/               # API Communication
│   │   ├── context/               # State Management
│   │   ├── styles/                # DriveZone Theme System
│   │   └── utils/                # Helper Functions
│   └── public/                   # Static Assets
├── docker-compose.yml           # Multi-Container Setup
└── README.md                   # Project Documentation
```

## 📋 Gereksinimler

### Geliştirme Ortamı

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server/) veya [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) veya [VS Code](https://code.visualstudio.com/)

### Opsiyonel

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## 🚀 Kurulum

### 1. Repository'yi Clone Edin

```bash
git clone https://github.com/yourusername/DriveZone.git
cd DriveZone
```

### 2. Backend Kurulum

#### Environment Variables Ayarlayın

`DriveZone.Server` dizininde `.env` dosyası oluşturun:

```env
# Database Connection
DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;

# JWT Configuration
JWT_SECRET=DriveZoneSecretKey2024!VerySecureKeyForProduction
JWT_ISSUER=DriveZone
JWT_AUDIENCE=DriveZoneUsers
```

#### Veritabanını Güncelleyin

```bash
cd DriveZone.Server
dotnet ef database update
```

#### Backend'i Çalıştırın

```bash
dotnet run
```

Backend `https://localhost:7042` adresinde çalışacaktır.

### 3. Frontend Kurulum

#### Dependencies Yükleyin

```bash
cd drivezone.client
npm install
```

#### Frontend'i Çalıştırın

```bash
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

### 4. Docker ile Kurulum

```bash
# Docker Compose ile tüm servisleri başlatın
docker-compose up --build
```

## 📖 Kullanım

### 1. Uygulamayı Başlatın

- Backend: `https://localhost:7042`
- Frontend: `http://localhost:3000`
- Swagger UI: `https://localhost:7042/swagger`

### 2. Admin Hesabı Oluşturun

İlk çalıştırmada otomatik olarak roller oluşturulur. Admin rolü için:

- API üzerinden kullanıcı oluşturun
- Veritabanından kullanıcıya "Admin" rolü atayın

### 3. Müşteri Kaydı

- Frontend üzerinden `/register` sayfasından yeni müşteri kaydı yapabilirsiniz
- Giriş yapın ve araç kiralama işlemlerine başlayın

## 🔌 API Endpoints

### Authentication

- `POST /api/Auth/register` - Member registration
- `POST /api/Auth/login` - Member login
- `GET /api/Auth/profile` - Profile information (🔒 Auth required)

### Vehicles

- `GET /api/Vehicle` - List all vehicles
- `GET /api/Vehicle/{id}` - Vehicle details (🔒 Auth required)
- `GET /api/Vehicle/available` - Available vehicles
- `POST /api/Vehicle` - Add new vehicle (🔒 Admin only)
- `PUT /api/Vehicle/{id}` - Update vehicle (🔒 Admin only)
- `DELETE /api/Vehicle/{id}` - Delete vehicle (🔒 Admin only)

### Bookings

- `GET /api/Booking` - List bookings (filtered by role)
- `GET /api/Booking/{id}` - Booking details (🔒 Auth required)
- `GET /api/Booking/member/{memberId}` - Member bookings (🔒 Auth required)
- `POST /api/Booking` - Create new booking (🔒 Auth required)
- `PUT /api/Booking/{id}` - Update booking (🔒 Auth required)
- `DELETE /api/Booking/{id}` - Cancel booking (🔒 Auth required)

## 🗃 Database Schema

### Members (extends ASP.NET Identity)

```sql
MemberId (string, PK)
FirstName (string)
LastName (string)
Email (string)
PhoneNumber (string)
FullAddress (string)
City (string)
Country (string)
ZipCode (string)
BirthDate (DateTime)
MembershipLevel (MembershipTier enum)
LoyaltyPoints (int)
IsVipMember (bool)
```

### Vehicles

```sql
VehicleId (string, PK)
Make (string)
Model (string)
Color (string)
ManufactureYear (int)
Category (VehicleCategory enum)
FuelType (FuelType enum)
Transmission (TransmissionType enum)
DailyRate (decimal)
HourlyRate (decimal)
SecurityDeposit (decimal)
Location (LocationCode enum)
IsAvailable (bool)
```

### Bookings

```sql
BookingId (string, PK)
BookingReference (string)
BookingStartDate (DateTime)
BookingEndDate (DateTime)
BaseAmount (decimal)
TaxAmount (decimal)
TotalAmount (decimal)
Status (BookingStatus enum)
PaymentStatus (PaymentStatus enum)
VehicleId (string, FK → Vehicles.VehicleId)
MemberId (string, FK → Members.MemberId)
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Required
DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=DriveZoneDB;Trusted_Connection=true;

# JWT Configuration
JWT_SECRET=DriveZoneSecretKey2024!VerySecureKeyForProduction
JWT_ISSUER=DriveZone
JWT_AUDIENCE=DriveZoneUsers
JWT_EXPIRATION_DAYS=30

# Application Settings
DRIVEZONE_SUPPORT_EMAIL=support@drivezone.com
DRIVEZONE_COMPANY_NAME=DriveZone Platform
DRIVEZONE_CURRENCY=TRY
DRIVEZONE_LOCATION=TR

# Logging (Optional)
ASPNETCORE_ENVIRONMENT=Development
```

### Frontend

Frontend konfigürasyonu `vite.config.js` dosyasında yapılır:

```javascript
server: {
    proxy: {
        '^/api': {
            target: 'https://localhost:7042',
            changeOrigin: true,
            secure: false
        }
    },
    port: 3000
}
```

## 🐳 Docker

### Development

```bash
# Sadece backend için
docker build -t drivezone-api ./DriveZone.Server

# Docker Compose ile tüm servisler
docker-compose up --build
```

### Production

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## 🔍 Sorun Giderme

### Yaygın Sorunlar

1. **Database Connection Error**

   - Connection string'i kontrol edin
   - SQL Server'ın çalıştığından emin olun
   - `dotnet ef database update` komutunu çalıştırın

2. **CORS Error**

   - Backend'de CORS policy ayarlarını kontrol edin
   - Frontend proxy ayarlarını kontrol edin

3. **JWT Token Error**

   - Token'ın doğru format'ta olduğunu kontrol edin
   - Token expiry time'ını kontrol edin

## 🧪 Test

### Backend Tests

```bash
cd DriveZone.Server
dotnet test
```

### Frontend Tests

```bash
cd drivezone.client
npm test
```

## 📊 Performance

### Backend Optimizations

- Repository pattern ile database access optimization
- Serilog ile efficient logging
- JWT token caching
- Entity Framework change tracking optimization

### Frontend Optimizations

- React lazy loading
- Axios request/response interceptors
- Local storage caching
- Component memoization

## 🔒 Security Features

- **Input Validation**: Model validation ve sanitization
- **SQL Injection Prevention**: Entity Framework parameterized queries
- **XSS Protection**: Input/output encoding
- **CSRF Protection**: Anti-forgery tokens
- **HTTPS Enforcement**: Production'da HTTPS redirect
- **JWT Security**: Secure token generation ve validation
- **Role-based Authorization**: Granular permission control

## 🌍 Localization

Proje şu anda İngilizce ve Türkçe desteklemektedir. Yeni diller eklemek için:

1. Backend: `Resources` klasörüne resource dosyaları ekleyin
2. Frontend: `i18n` konfigürasyonu yapın

## 📈 Monitoring & Logging

### Serilog Configuration

- Console logging (Development)
- File logging (Production)
- Structured logging
- Error tracking

### Health Checks

- Database connectivity
- External service availability
- Memory usage monitoring

## 🚧 Roadmap

- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (SignalR)
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] File upload for car images
- [ ] SMS notifications
- [ ] Social media login
- [ ] Caching layer (Redis)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Development Guidelines

- Clean code principles
- SOLID principles
- Unit tests yazın
- Documentation güncelleyin
- Code review süreci

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Katkıda Bulunanlar

- **Geliştirici**: [Your Name](https://github.com/yourusername)

## 📞 İletişim

- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Teşekkürler

- ASP.NET Core team
- React community
- Bootstrap ve Tailwind CSS
- Tüm açık kaynak katkıda bulunanlara

---

## 🌟 DriveZone Premium Özellikleri

### 💎 Üyelik Avantajları

- **Bronze**: Temel kiralama + %5 loyalty points
- **Silver**: %10 indirim + öncelikli destek
- **Gold**: %15 indirim + ücretsiz sigorta yükseltmesi
- **Platinum**: %20 indirim + VIP araç erişimi + concierge hizmet

### 🔒 Güvenlik ve Doğrulama

- **TC Kimlik Doğrulama**: Gerçek kimlik kontrolü
- **Ehliyet Geçerlilik**: 3 ay geçerlilik kontrolü
- **Güvenlik Deposu**: Araç kategorisine göre dinamik tutar
- **Sigorta Kapsamı**: Kaza, hasar ve çalınma koruması

### 📊 İş Zekası Özellikleri

- **Dinamik Fiyatlandırma**: Sezon, talep ve araç tipine göre
- **Predictive Analytics**: Müşteri davranış tahmini
- **Revenue Optimization**: Kar maksimizasyonu algoritmaları
- **Fleet Management**: Araç rotasyon ve bakım takibi

### 🎨 Modern UI/UX

- **Design System**: Custom CSS variables + Inter/Lexend fonts
- **Color Palette**: Indigo/Purple/Cyan premium gradient'leri
- **Animations**: Smooth transitions ve micro-interactions
- **Responsive**: Mobile-first yaklaşım + PWA hazır

## 🚀 Gelecek Geliştirmeler (Roadmap)

### Phase 1: Core Platform ✅

- [x] Premium vehicle management system
- [x] Advanced booking engine with insurance
- [x] Membership tier system
- [x] Modern responsive UI

### Phase 2: Smart Features 🚧

- [ ] **AI-Powered Recommendations**: Müşteri tercihi bazlı araç önerisi
- [ ] **IoT Integration**: Araç telematiği ve gerçek zamanlı takip
- [ ] **Mobile App**: React Native ile iOS/Android uygulaması
- [ ] **Real-time Chat**: Müşteri destek chat sistemi

### Phase 3: Enterprise Features 📋

- [ ] **Corporate Accounts**: Kurumsal müşteri yönetimi
- [ ] **Fleet Analytics**: Detaylı raporlama ve dashboard
- [ ] **API Marketplace**: Third-party entegrasyonlar
- [ ] **Multi-language**: Çoklu dil desteği (EN, DE, FR)

### Phase 4: Advanced Integrations 🔮

- [ ] **Payment Gateway**: Stripe/PayPal entegrasyonu
- [ ] **Email/SMS Notifications**: Otomatik bildirim sistemi
- [ ] **Social Login**: Google/Facebook/Apple ID
- [ ] **Blockchain Loyalty**: NFT tabanlı sadakat programı

---

<div align="center">

**🚗 Drive Premium, Drive DriveZone 🚗**

Made with ❤️ by DriveZone Team

</div>
