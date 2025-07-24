namespace DriveZone.Server.Models.Enums
{
    public enum LocationCode
    {
        TR, // Turkey
        DE, // Germany
        FR, // France
        IT, // Italy
        ES, // Spain
        UK, // United Kingdom
        US, // United States
        AE  // United Arab Emirates
    }

    public enum VehicleCategory
    {
        Economy,
        Compact,
        MidSize,
        FullSize,
        Premium,
        Luxury,
        SUV,
        Van,
        Convertible,
        Sports,
        Electric
    }

    public enum FuelType
    {
        Gasoline,
        Diesel,
        Electric,
        Hybrid,
        PluginHybrid
    }

    public enum TransmissionType
    {
        Manual,
        Automatic,
        CVT
    }

    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Active,
        Completed,
        Cancelled,
        NoShow
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Failed,
        Refunded,
        PartialRefund
    }

    public enum InsuranceType
    {
        Basic,
        Premium,
        Comprehensive
    }

    public enum MembershipTier
    {
        Bronze,
        Silver,
        Gold,
        Platinum
    }
}