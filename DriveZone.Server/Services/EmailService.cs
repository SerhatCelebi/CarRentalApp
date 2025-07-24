using DriveZone.Server.Models;
using DriveZone.Server.Services.IServices;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace DriveZone.Server.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly IWebHostEnvironment _environment;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _logger = logger;
            _environment = environment;
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string firstName, string lastName)
        {
            var subject = "DriveZone'a Hoş Geldiniz! 🚗";
            var body = GenerateWelcomeEmailBody(firstName, lastName);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendBookingConfirmationAsync(string bookingId)
        {
            try
            {
                // This method will fetch booking details and send confirmation email
                // For now, just log the attempt
                _logger.LogInformation("Booking confirmation email requested for booking: {BookingId}", bookingId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking confirmation for booking: {BookingId}", bookingId);
                return false;
            }
        }

        public async Task<bool> SendBookingReminderAsync(string email, string bookingReference, DateTime bookingDate)
        {
            var subject = $"Rezervasyon Hatırlatması - {bookingReference}";
            var body = GenerateBookingReminderBody(bookingReference, bookingDate);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendPasswordResetAsync(string email, string resetToken, string firstName)
        {
            var subject = "DriveZone Şifre Sıfırlama";
            var body = GeneratePasswordResetBody(firstName, resetToken);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendPaymentReceiptAsync(string email, string transactionId, decimal amount)
        {
            var subject = $"Ödeme Makbuzu - {transactionId}";
            var body = GeneratePaymentReceiptBody(transactionId, amount);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendVipUpgradeNotificationAsync(string email, string firstName, string newLevel)
        {
            var subject = "🌟 VIP Üyelik Yükseltmesi!";
            var body = GenerateVipUpgradeBody(firstName, newLevel);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendMaintenanceNotificationAsync(string email, string vehicleInfo, DateTime maintenanceDate)
        {
            var subject = "Araç Bakım Bildirimi";
            var body = GenerateMaintenanceNotificationBody(vehicleInfo, maintenanceDate);

            return await SendEmailAsync(email, subject, body);
        }

        public async Task<bool> SendBookingCancellationAsync(string bookingId)
        {
            try
            {
                // This method will fetch booking details and send cancellation email
                _logger.LogInformation("Booking cancellation email requested for booking: {BookingId}", bookingId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking cancellation for booking: {BookingId}", bookingId);
                return false;
            }
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                // In development, just log the email
                if (_environment.IsDevelopment())
                {
                    _logger.LogInformation("Email would be sent to {Email}:\nSubject: {Subject}\nBody: {Body}",
                        toEmail, subject, body);
                    return true;
                }

                var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["Email:Username"] ?? "";
                var smtpPassword = _configuration["Email:Password"] ?? "";
                var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@drivezone.com";
                var fromName = _configuration["Email:FromName"] ?? "DriveZone Platform";

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true,
                    Timeout = 10000
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                    BodyEncoding = Encoding.UTF8,
                    SubjectEncoding = Encoding.UTF8
                };

                mailMessage.To.Add(new MailAddress(toEmail));

                await client.SendMailAsync(mailMessage);

                _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", toEmail, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", toEmail, subject);
                return false;
            }
        }

        #region Email Templates

        private static string GenerateWelcomeEmailBody(string firstName, string lastName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>DriveZone'a Hoş Geldiniz</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>🚗 DriveZone'a Hoş Geldiniz!</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #667eea; margin-top: 0;'>Merhaba {firstName} {lastName}!</h2>
        
        <p>DriveZone ailesine katıldığınız için çok mutluyuz! Premium araç kiralama deneyiminiz şimdi başlıyor.</p>
        
        <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;'>
            <h3 style='color: #667eea; margin-top: 0;'>Neler Kazandınız:</h3>
            <ul>
                <li>✅ Geniş araç filosuna erişim</li>
                <li>✅ 7/24 müşteri desteği</li>
                <li>✅ Sadakat puanları ve indirimler</li>
                <li>✅ VIP üyelik fırsatları</li>
                <li>✅ Güvenli ödeme sistemi</li>
            </ul>
        </div>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='https://drivezone.com/vehicles' style='background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>
                Araçları İnceleyin
            </a>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            Sorularınız için: <a href='mailto:destek@drivezone.com'>destek@drivezone.com</a><br>
            DriveZone Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private static string GenerateBookingConfirmationBody(Booking booking)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Rezervasyon Onayı</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: #28a745; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>✅ Rezervasyonunuz Onaylandı!</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #28a745; margin-top: 0;'>Rezervasyon Detayları</h2>
        
        <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Rezervasyon No:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{booking.BookingReference}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Araç:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{booking.Vehicle?.Make} {booking.Vehicle?.Model}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Alış Tarihi:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{booking.BookingStartDate:dd.MM.yyyy HH:mm}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Dönüş Tarihi:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{booking.BookingEndDate:dd.MM.yyyy HH:mm}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Toplam Tutar:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #28a745;'>{booking.TotalAmount:C}</td>
                </tr>
            </table>
        </div>
        
        <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
            <h4 style='margin-top: 0; color: #856404;'>Önemli Hatırlatmalar:</h4>
            <ul style='margin-bottom: 0;'>
                <li>Ehliyetinizi ve kimlik belgenizi yanınızda bulundurun</li>
                <li>Alış saatinden 15 dakika önce ofisimizde olun</li>
                <li>Araç teslim alırken hasar kontrolü yapın</li>
            </ul>
        </div>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='https://drivezone.com/booking/{booking.BookingId}' style='background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>
                Rezervasyon Detayları
            </a>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            DriveZone Ekibi<br>
            Destek: <a href='mailto:destek@drivezone.com'>destek@drivezone.com</a>
        </p>
    </div>
</body>
</html>";
        }

        private static string GenerateBookingReminderBody(string bookingReference, DateTime bookingDate)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Rezervasyon Hatırlatması</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: #ffc107; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: #212529; margin: 0; font-size: 28px;'>🔔 Rezervasyon Hatırlatması</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #ffc107; margin-top: 0;'>Rezervasyonunuz Yaklaşıyor!</h2>
        
        <p>Rezervasyon No: <strong>{bookingReference}</strong></p>
        <p>Tarih: <strong>{bookingDate:dd.MM.yyyy HH:mm}</strong></p>
        
        <div style='background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
            <h4 style='margin-top: 0; color: #155724;'>Hatırlatma:</h4>
            <p style='margin-bottom: 0;'>Rezervasyonunuz yarın! Lütfen gerekli belgelerinizi hazırlayın ve zamanında ofisimizde olun.</p>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            DriveZone Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private static string GeneratePasswordResetBody(string firstName, string resetToken)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Şifre Sıfırlama</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: #dc3545; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>🔐 Şifre Sıfırlama</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #dc3545; margin-top: 0;'>Merhaba {firstName}!</h2>
        
        <p>DriveZone hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
        
        <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>
            <p>Sıfırlama kodu:</p>
            <div style='background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; color: #dc3545; border: 2px dashed #dc3545;'>
                {resetToken}
            </div>
            <p style='font-size: 14px; color: #666; margin-top: 15px;'>Bu kod 15 dakika geçerlidir.</p>
        </div>
        
        <div style='background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;'>
            <p style='margin-bottom: 0; color: #721c24;'><strong>Güvenlik Uyarısı:</strong> Bu talebi siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.</p>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            DriveZone Güvenlik Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private static string GeneratePaymentReceiptBody(string transactionId, decimal amount)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Ödeme Makbuzu</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: #17a2b8; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>💳 Ödeme Makbuzu</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #17a2b8; margin-top: 0;'>Ödemeniz Alındı</h2>
        
        <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>İşlem No:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{transactionId}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Tutar:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #28a745;'>{amount:C}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;'>Tarih:</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>{DateTime.Now:dd.MM.yyyy HH:mm}</td>
                </tr>
            </table>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            Bu makbuzu saklayınız.<br>
            DriveZone Muhasebe
        </p>
    </div>
</body>
</html>";
        }

        private static string GenerateVipUpgradeBody(string firstName, string newLevel)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>VIP Üyelik Yükseltmesi</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: #212529; margin: 0; font-size: 28px;'>🌟 VIP Üyelik Yükseltmesi!</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #ffd700; margin-top: 0;'>Tebrikler {firstName}!</h2>
        
        <p>Üyeliğiniz <strong>{newLevel}</strong> seviyesine yükseltildi!</p>
        
        <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffd700;'>
            <h3 style='color: #ffd700; margin-top: 0;'>Yeni Ayricalıklarınız:</h3>
            <ul>
                <li>✨ Özel indirimler</li>
                <li>🚗 Premium araçlara öncelikli erişim</li>
                <li>⚡ Hızlı rezervasyon işlemi</li>
                <li>🎁 Özel kampanya fırsatları</li>
            </ul>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            DriveZone VIP Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private static string GenerateMaintenanceNotificationBody(string vehicleInfo, DateTime maintenanceDate)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Araç Bakım Bildirimi</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: #fd7e14; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>🔧 Araç Bakım Bildirimi</h1>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;'>
        <h2 style='color: #fd7e14; margin-top: 0;'>Bakım Bilgilendirmesi</h2>
        
        <p>Rezervasyonunuzdaki araç (<strong>{vehicleInfo}</strong>) planlı bakım nedeniyle {maintenanceDate:dd.MM.yyyy} tarihinde hizmet dışı olacaktır.</p>
        
        <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
            <p style='margin-bottom: 0;'>Size alternatif araç seçenekleri sunacağız. En kısa sürede sizinle iletişime geçeceğiz.</p>
        </div>
        
        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
            DriveZone Müşteri Hizmetleri
        </p>
    </div>
</body>
</html>";
        }

        #endregion
    }
}