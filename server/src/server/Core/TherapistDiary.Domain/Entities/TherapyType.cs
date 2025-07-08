namespace TherapistDiary.Domain.Entities;

using Common.Constants;
using Errors;
using Primitives.Abstract;
using Resources;
using Shared;

public class TherapyType : DeletableEntity
{
    private TherapyType()
    {
        Therapies = new HashSet<Therapy>();
    }

    private TherapyType(string name, string bannerPictureUrl) : this()
    {
        Name = name;
        BannerPictureUrl = bannerPictureUrl;
    }

    public string Name { get; private set; }
    public string BannerPictureUrl { get; private set; }
    public ICollection<Therapy> Therapies { get; private set; }

    public static Result<TherapyType> Create(string name, string bannerPictureUrl)
    {
        var therapy = new TherapyType(name, bannerPictureUrl);
        return therapy.Validate(Operations.Create);
    }

    private Result<TherapyType> Validate(Operations operation)

    {
        return Result.Success(this)
            .Validate(Validator.Length.Max(Name, GlobalConstants.TherapyType.NameMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, GlobalConstants.Person.NameMinLength,
                        GlobalConstants.TherapyType.NameMaxLength),
                    field: nameof(Name),
                    operation: operation))
            .Validate(Validator.Length.Max(BannerPictureUrl, GlobalConstants.TherapyType.BannerPictureUrlMaxLength),
                Error.Create(
                    message: string.Format(ErrorMessages.INVALID_FIELD_LENGTH, GlobalConstants.TherapyType.BannerPictureUrlMinLength,
                        GlobalConstants.TherapyType.BannerPictureUrlMaxLength),
                    field: nameof(BannerPictureUrl),
                    operation: operation));
    }
}
