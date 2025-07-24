namespace DriveZone.Server.Models.ResultModel
{
    public class ResultModel<T>
    {
        public T? Value { get; set; }
        public string? Error { get; set; }
        public bool HasError => !string.IsNullOrEmpty(Error);
        public bool IsSuccess => !HasError;
        public Dictionary<string, object>? CostBreakdown { get; set; }

        public static ResultModel<T> Success(T value)
        {
            return new ResultModel<T>
            {
                Value = value,
                Error = null
            };
        }

        public static ResultModel<T> Error(string error)
        {
            return new ResultModel<T>
            {
                Value = default,
                Error = error
            };
        }

        public static ResultModel<T> SuccessWithBreakdown(T value, Dictionary<string, object> breakdown)
        {
            return new ResultModel<T>
            {
                Value = value,
                Error = null,
                CostBreakdown = breakdown
            };
        }
    }
}