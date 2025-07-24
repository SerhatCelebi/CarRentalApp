namespace DriveZone.Server.Models.ResultModel
{
    public class ErrorModel
    {
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public int ErrorCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? TraceId { get; set; }
        public Dictionary<string, string[]>? ValidationErrors { get; set; }

        public ErrorModel() { }

        public ErrorModel(string message)
        {
            Message = message;
        }

        public ErrorModel(string message, string details) : this(message)
        {
            Details = details;
        }

        public ErrorModel(string message, int errorCode) : this(message)
        {
            ErrorCode = errorCode;
        }

        public ErrorModel(string message, string details, int errorCode) : this(message, details)
        {
            ErrorCode = errorCode;
        }

        public static ErrorModel ValidationError(Dictionary<string, string[]> validationErrors)
        {
            return new ErrorModel
            {
                Message = "Validation failed",
                ErrorCode = 400,
                ValidationErrors = validationErrors
            };
        }

        public static ErrorModel NotFound(string resource = "Resource")
        {
            return new ErrorModel($"{resource} not found", 404);
        }

        public static ErrorModel Unauthorized(string message = "Unauthorized access")
        {
            return new ErrorModel(message, 401);
        }

        public static ErrorModel Forbidden(string message = "Access forbidden")
        {
            return new ErrorModel(message, 403);
        }

        public static ErrorModel InternalServerError(string message = "Internal server error")
        {
            return new ErrorModel(message, 500);
        }

        public static ErrorModel BadRequest(string message = "Bad request")
        {
            return new ErrorModel(message, 400);
        }
    }
}