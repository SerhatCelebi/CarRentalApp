using DriveZone.Server.Models;
using DriveZone.Server.Models.DTOs;
using DriveZone.Server.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DriveZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IMemberService _memberService;
        private readonly ILogger<PaymentController> _logger;
        private readonly IConfiguration _configuration;

        public PaymentController(
            IBookingService bookingService,
            IMemberService memberService,
            ILogger<PaymentController> logger,
            IConfiguration configuration)
        {
            _bookingService = bookingService;
            _memberService = memberService;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Process payment for a booking
        /// </summary>
        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDTO paymentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            try
            {
                // Validate payment details
                if (!paymentDto.PaymentDetails.IsValidCreditCard())
                {
                    return BadRequest(new { error = "Invalid credit card information" });
                }

                // Get booking details
                var booking = await _bookingService.GetBookingByIdAsync(paymentDto.BookingId);
                if (booking == null)
                {
                    return NotFound(new { error = "Booking not found" });
                }

                // Verify booking belongs to user
                if (booking.MemberId != User.FindFirst(ClaimTypes.NameIdentifier)?.Value)
                {
                    return Forbid("You can only pay for your own bookings");
                }

                // Check if booking is already paid
                if (booking.PaymentStatus == "Paid")
                {
                    return BadRequest(new { error = "Booking is already paid" });
                }

                // Process payment (integrate with payment gateway)
                var paymentResult = await ProcessPaymentWithGateway(paymentDto.PaymentDetails, booking.TotalAmount);

                if (!paymentResult.Success)
                {
                    _logger.LogWarning("Payment failed for booking {BookingId}: {Error}",
                        paymentDto.BookingId, paymentResult.ErrorMessage);

                    return BadRequest(new
                    {
                        error = "Payment processing failed",
                        details = paymentResult.ErrorMessage
                    });
                }

                // Update booking payment status
                var updateResult = await _bookingService.UpdatePaymentStatusAsync(
                    paymentDto.BookingId, "Paid", paymentResult.TransactionId);

                if (updateResult.HasError)
                {
                    _logger.LogError("Failed to update payment status for booking {BookingId}: {Error}",
                        paymentDto.BookingId, updateResult.Error);

                    return StatusCode(500, new { error = "Payment processed but status update failed" });
                }

                // Award loyalty points
                await AwardLoyaltyPoints(userEmail, booking.TotalAmount);

                _logger.LogInformation("Payment processed successfully for booking {BookingId} by user {Email}",
                    paymentDto.BookingId, userEmail);

                return Ok(new
                {
                    success = true,
                    message = "Payment processed successfully",
                    transactionId = paymentResult.TransactionId,
                    booking = updateResult.Value,
                    receipt = GeneratePaymentReceipt(paymentResult, booking)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for booking {BookingId}", paymentDto.BookingId);
                return StatusCode(500, new { error = "An error occurred while processing payment" });
            }
        }

        /// <summary>
        /// Get payment history for current user
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetPaymentHistory(int page = 1, int limit = 20)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            try
            {
                var payments = await _bookingService.GetMemberPaymentHistoryAsync(userId, page, limit);
                var totalCount = await _bookingService.GetMemberPaymentCountAsync(userId);

                return Ok(new
                {
                    payments,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = (int)Math.Ceiling((double)totalCount / limit),
                        totalCount,
                        hasNext = page * limit < totalCount,
                        hasPrevious = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment history for user {UserId}", userId);
                return StatusCode(500, new { error = "Failed to retrieve payment history" });
            }
        }

        /// <summary>
        /// Get payment receipt
        /// </summary>
        [HttpGet("receipt/{transactionId}")]
        public async Task<IActionResult> GetPaymentReceipt(string transactionId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            try
            {
                var payment = await _bookingService.GetPaymentByTransactionIdAsync(transactionId);
                if (payment == null)
                {
                    return NotFound(new { error = "Payment receipt not found" });
                }

                // Verify payment belongs to user
                if (payment.MemberId != userId)
                {
                    return Forbid("You can only view your own payment receipts");
                }

                var receipt = await GenerateDetailedReceipt(payment);

                return Ok(new
                {
                    success = true,
                    receipt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment receipt {TransactionId}", transactionId);
                return StatusCode(500, new { error = "Failed to retrieve payment receipt" });
            }
        }

        /// <summary>
        /// Refund a payment
        /// </summary>
        [HttpPost("refund")]
        public async Task<IActionResult> ProcessRefund([FromBody] RefundRequestDTO refundDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Invalid token" });
            }

            try
            {
                var booking = await _bookingService.GetBookingByIdAsync(refundDto.BookingId);
                if (booking == null)
                {
                    return NotFound(new { error = "Booking not found" });
                }

                // Verify booking belongs to user
                if (booking.MemberId != userId)
                {
                    return Forbid("You can only request refunds for your own bookings");
                }

                // Check refund eligibility
                var refundEligibility = await CheckRefundEligibility(booking);
                if (!refundEligibility.IsEligible)
                {
                    return BadRequest(new { error = refundEligibility.Reason });
                }

                // Calculate refund amount based on cancellation policy
                var refundAmount = CalculateRefundAmount(booking, refundDto.RequestedAt);

                // Process refund with payment gateway
                var refundResult = await ProcessRefundWithGateway(booking.TransactionId, refundAmount, refundDto.Reason);

                if (!refundResult.Success)
                {
                    _logger.LogWarning("Refund failed for booking {BookingId}: {Error}",
                        refundDto.BookingId, refundResult.ErrorMessage);

                    return BadRequest(new
                    {
                        error = "Refund processing failed",
                        details = refundResult.ErrorMessage
                    });
                }

                // Update booking status
                var updateResult = await _bookingService.UpdateBookingStatusAsync(
                    refundDto.BookingId, "Refunded", refundDto.Reason);

                if (updateResult.HasError)
                {
                    _logger.LogError("Failed to update booking status after refund {BookingId}: {Error}",
                        refundDto.BookingId, updateResult.Error);
                }

                _logger.LogInformation("Refund processed successfully for booking {BookingId}",
                    refundDto.BookingId);

                return Ok(new
                {
                    success = true,
                    message = "Refund processed successfully",
                    refundTransactionId = refundResult.RefundTransactionId,
                    refundAmount = refundAmount,
                    originalAmount = booking.TotalAmount,
                    refundReason = refundDto.Reason,
                    processedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for booking {BookingId}", refundDto.BookingId);
                return StatusCode(500, new { error = "An error occurred while processing refund" });
            }
        }

        /// <summary>
        /// Get supported payment methods
        /// </summary>
        [HttpGet("methods")]
        [AllowAnonymous]
        public IActionResult GetPaymentMethods()
        {
            var paymentMethods = new
            {
                CreditCards = new[]
                {
                    new { Name = "Visa", Icon = "visa", MinAmount = 10, MaxAmount = 50000 },
                    new { Name = "Mastercard", Icon = "mastercard", MinAmount = 10, MaxAmount = 50000 },
                    new { Name = "American Express", Icon = "amex", MinAmount = 10, MaxAmount = 50000 }
                },
                DebitCards = new[]
                {
                    new { Name = "Visa Debit", Icon = "visa-debit", MinAmount = 10, MaxAmount = 10000 },
                    new { Name = "Mastercard Debit", Icon = "mastercard-debit", MinAmount = 10, MaxAmount = 10000 }
                },
                DigitalWallets = new[]
                {
                    new { Name = "PayPal", Icon = "paypal", MinAmount = 10, MaxAmount = 25000 },
                    new { Name = "Apple Pay", Icon = "apple-pay", MinAmount = 10, MaxAmount = 10000 },
                    new { Name = "Google Pay", Icon = "google-pay", MinAmount = 10, MaxAmount = 10000 }
                },
                BankTransfer = new
                {
                    Name = "Bank Transfer",
                    Icon = "bank-transfer",
                    MinAmount = 100,
                    MaxAmount = 100000,
                    ProcessingTime = "1-3 business days"
                }
            };

            return Ok(paymentMethods);
        }

        #region Private Helper Methods

        private async Task<PaymentGatewayResult> ProcessPaymentWithGateway(PaymentDetailsDTO paymentDetails, decimal amount)
        {
            // Simulate payment gateway integration
            // In real implementation, you would integrate with actual payment providers like Stripe, PayPal, etc.

            await Task.Delay(1000); // Simulate API call delay

            // Basic validation
            if (amount <= 0)
            {
                return new PaymentGatewayResult
                {
                    Success = false,
                    ErrorMessage = "Invalid amount"
                };
            }

            // Simulate random failures for testing
            var random = new Random();
            if (random.Next(1, 101) <= 5) // 5% failure rate
            {
                return new PaymentGatewayResult
                {
                    Success = false,
                    ErrorMessage = "Payment gateway timeout"
                };
            }

            return new PaymentGatewayResult
            {
                Success = true,
                TransactionId = $"TXN_{DateTime.UtcNow:yyyyMMddHHmmss}_{random.Next(1000, 9999)}",
                Amount = amount,
                ProcessedAt = DateTime.UtcNow
            };
        }

        private async Task<RefundGatewayResult> ProcessRefundWithGateway(string originalTransactionId, decimal refundAmount, string reason)
        {
            // Simulate refund gateway integration
            await Task.Delay(500);

            var random = new Random();
            return new RefundGatewayResult
            {
                Success = true,
                RefundTransactionId = $"REF_{DateTime.UtcNow:yyyyMMddHHmmss}_{random.Next(1000, 9999)}",
                OriginalTransactionId = originalTransactionId,
                RefundAmount = refundAmount,
                ProcessedAt = DateTime.UtcNow
            };
        }

        private async Task<RefundEligibilityResult> CheckRefundEligibility(Booking booking)
        {
            // Check if booking can be refunded based on business rules
            if (booking.Status == "Completed")
            {
                return new RefundEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Cannot refund completed bookings"
                };
            }

            if (booking.Status == "Cancelled" || booking.Status == "Refunded")
            {
                return new RefundEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Booking is already cancelled or refunded"
                };
            }

            if (booking.BookingStartDate <= DateTime.UtcNow)
            {
                return new RefundEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Cannot refund bookings that have already started"
                };
            }

            return new RefundEligibilityResult
            {
                IsEligible = true,
                Reason = "Eligible for refund"
            };
        }

        private decimal CalculateRefundAmount(Booking booking, DateTime requestedAt)
        {
            var hoursUntilStart = (booking.BookingStartDate - requestedAt).TotalHours;

            // Cancellation policy based on time before booking starts
            if (hoursUntilStart >= 72) // 3+ days
                return booking.TotalAmount; // Full refund

            if (hoursUntilStart >= 24) // 1-3 days
                return booking.TotalAmount * 0.75m; // 75% refund

            if (hoursUntilStart >= 6) // 6-24 hours
                return booking.TotalAmount * 0.50m; // 50% refund

            return booking.TotalAmount * 0.25m; // Less than 6 hours - 25% refund
        }

        private async Task AwardLoyaltyPoints(string userEmail, decimal amount)
        {
            try
            {
                // Award 1 point per 10 TRY spent
                var pointsToAward = (int)(amount / 10);
                if (pointsToAward > 0)
                {
                    await _memberService.AddLoyaltyPointsAsync(userEmail, pointsToAward);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to award loyalty points for user {Email}", userEmail);
            }
        }

        private object GeneratePaymentReceipt(PaymentGatewayResult paymentResult, Booking booking)
        {
            return new
            {
                TransactionId = paymentResult.TransactionId,
                Amount = paymentResult.Amount,
                Currency = "TRY",
                ProcessedAt = paymentResult.ProcessedAt,
                BookingReference = booking.BookingReference,
                PaymentMethod = "Credit Card", // This should come from payment details
                Status = "Completed"
            };
        }

        private async Task<object> GenerateDetailedReceipt(object payment)
        {
            // Generate detailed receipt with all payment information
            return new
            {
                ReceiptNumber = $"RCP_{DateTime.UtcNow:yyyyMMddHHmmss}",
                GeneratedAt = DateTime.UtcNow,
                // Add detailed payment information
            };
        }

        #endregion
    }

    // Supporting classes
    public class ProcessPaymentDTO
    {
        [Required]
        public string BookingId { get; set; } = string.Empty;

        [Required]
        public PaymentDetailsDTO PaymentDetails { get; set; } = new();
    }

    public class RefundRequestDTO
    {
        [Required]
        public string BookingId { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }

    public class PaymentGatewayResult
    {
        public bool Success { get; set; }
        public string? TransactionId { get; set; }
        public decimal Amount { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class RefundGatewayResult
    {
        public bool Success { get; set; }
        public string? RefundTransactionId { get; set; }
        public string? OriginalTransactionId { get; set; }
        public decimal RefundAmount { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class RefundEligibilityResult
    {
        public bool IsEligible { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}