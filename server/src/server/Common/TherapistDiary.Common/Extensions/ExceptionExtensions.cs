namespace TherapistDiary.Common.Extensions;

using System.Text;

public static class ExceptionExtensions
{
    public static string ToMessageAndCompleteStacktrace(this Exception exception)
    {
        var e = exception;
        var s = new StringBuilder();
        while (e != null)
        {
            s.AppendLine("Exception type: " + e.GetType().FullName);
            s.AppendLine("Message       : " + e.Message);
            s.AppendLine("Stacktrace:");
            s.AppendLine(e.StackTrace);
            s.AppendLine();
            if (e.InnerException is not null) e = e.InnerException;
        }

        return s.ToString();
    }

    public static string ToMessage(this Exception exception)
    {
        var e = exception;
        var s = new StringBuilder();
        while (e != null)
        {
            s.AppendLine("Exception type: " + e.GetType().FullName);
            s.AppendLine("Message       : " + e.Message);
            s.AppendLine();
            if (e.InnerException is not null) e = e.InnerException;
        }

        return s.ToString();
    }
}