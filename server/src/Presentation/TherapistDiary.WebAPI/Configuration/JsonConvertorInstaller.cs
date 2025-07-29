namespace TherapistDiary.WebAPI.Configuration;

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Services;

public class JsonConvertorInstaller:IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<BusinessHours>(
            configuration.GetSection("BusinessHours"));

        services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new TimeOnlyJsonConverter());
        });
    }
}

public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private const string Format = "H:mm";

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return TimeOnly.ParseExact(value!, Format, CultureInfo.InvariantCulture);
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
    }
}
