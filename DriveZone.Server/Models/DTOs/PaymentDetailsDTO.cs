using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace DriveZone.Server.Models.DTOs
{
    public class PaymentDetailsDTO
    {
        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, DebitCard, BankTransfer, etc.

        [Required]
        [MaxLength(20)]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CardHolderName { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(0[1-9]|1[0-2])\/\d{2}$", ErrorMessage = "Expiry date must be in MM/YY format")]
        public string ExpiryDate { get; set; } = string.Empty;

        [Required]
        [StringLength(4, MinimumLength = 3)]
        public string CVV { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "TRY";

        [MaxLength(100)]
        public string? BillingAddress { get; set; }

        [MaxLength(50)]
        public string? BillingCity { get; set; }

        [MaxLength(10)]
        public string? BillingZipCode { get; set; }

        public bool SaveCard { get; set; } = false;

        [MaxLength(500)]
        public string? Description { get; set; }

        // Validation helper methods
        public bool IsValidCreditCard()
        {
            if (string.IsNullOrEmpty(CardNumber) || string.IsNullOrEmpty(CVV) || string.IsNullOrEmpty(ExpiryDate))
                return false;

            // Remove spaces and validate card number
            var cleanCardNumber = CardNumber.Replace(" ", "").Replace("-", "");
            if (!IsValidCardNumber(cleanCardNumber))
                return false;

            // Validate CVV
            if (!Regex.IsMatch(CVV, @"^\d{3,4}$"))
                return false;

            // Validate expiry date
            if (!IsValidExpiryDate(ExpiryDate))
                return false;

            // Validate card holder name
            if (string.IsNullOrWhiteSpace(CardHolderName) || CardHolderName.Length < 2)
                return false;

            return true;
        }

        private bool IsValidCardNumber(string cardNumber)
        {
            // Basic validation using Luhn algorithm
            if (string.IsNullOrEmpty(cardNumber) || !Regex.IsMatch(cardNumber, @"^\d{13,19}$"))
                return false;

            return IsValidLuhn(cardNumber);
        }

        private bool IsValidLuhn(string cardNumber)
        {
            var digits = cardNumber.Select(c => int.Parse(c.ToString())).Reverse().ToArray();
            var sum = 0;

            for (int i = 0; i < digits.Length; i++)
            {
                var digit = digits[i];
                if (i % 2 == 1)
                {
                    digit *= 2;
                    if (digit > 9)
                        digit -= 9;
                }
                sum += digit;
            }

            return sum % 10 == 0;
        }

        private bool IsValidExpiryDate(string expiryDate)
        {
            if (!Regex.IsMatch(expiryDate, @"^(0[1-9]|1[0-2])\/\d{2}$"))
                return false;

            var parts = expiryDate.Split('/');
            var month = int.Parse(parts[0]);
            var year = int.Parse("20" + parts[1]); // Assume 20xx

            var expiry = new DateTime(year, month, DateTime.DaysInMonth(year, month));
            return expiry > DateTime.Now;
        }

        public string GetCardType()
        {
            var cleanCardNumber = CardNumber.Replace(" ", "").Replace("-", "");

            if (cleanCardNumber.StartsWith("4"))
                return "Visa";
            else if (cleanCardNumber.StartsWith("5") || cleanCardNumber.StartsWith("2"))
                return "Mastercard";
            else if (cleanCardNumber.StartsWith("34") || cleanCardNumber.StartsWith("37"))
                return "American Express";
            else if (cleanCardNumber.StartsWith("6"))
                return "Discover";
            else
                return "Unknown";
        }

        public string GetMaskedCardNumber()
        {
            if (string.IsNullOrEmpty(CardNumber) || CardNumber.Length < 4)
                return "****";

            var cleanCardNumber = CardNumber.Replace(" ", "").Replace("-", "");
            return "**** **** **** " + cleanCardNumber.Substring(cleanCardNumber.Length - 4);
        }
    }
}