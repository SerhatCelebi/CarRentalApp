using DriveZone.Server.Models;

namespace DriveZone.Server.Services.IServices
{
    public interface IEmailService
    {
        /// <summary>
        /// Send welcome email to new members
        /// </summary>
        Task<bool> SendWelcomeEmailAsync(string email, string firstName, string lastName);

        /// <summary>
        /// Send booking confirmation email
        /// </summary>
        Task<bool> SendBookingConfirmationAsync(string email, string bookingReference, Booking booking);

        /// <summary>
        /// Send booking confirmation email (overload for booking ID)
        /// </summary>
        Task<bool> SendBookingConfirmationAsync(string bookingId);

        /// <summary>
        /// Send booking cancellation email
        /// </summary>
        Task<bool> SendBookingCancellationAsync(string bookingId);

        /// <summary>
        /// Send booking reminder email
        /// </summary>
        Task<bool> SendBookingReminderAsync(string email, string bookingReference, DateTime bookingDate);

        /// <summary>
        /// Send password reset email
        /// </summary>
        Task<bool> SendPasswordResetAsync(string email, string resetToken, string firstName);

        /// <summary>
        /// Send payment receipt email
        /// </summary>
        Task<bool> SendPaymentReceiptAsync(string email, string transactionId, decimal amount);

        /// <summary>
        /// Send VIP upgrade notification
        /// </summary>
        Task<bool> SendVipUpgradeNotificationAsync(string email, string firstName, string newLevel);

        /// <summary>
        /// Send maintenance notification
        /// </summary>
        Task<bool> SendMaintenanceNotificationAsync(string email, string vehicleInfo, DateTime maintenanceDate);
    }
}