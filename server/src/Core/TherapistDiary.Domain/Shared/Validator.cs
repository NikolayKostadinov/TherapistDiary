// ------------------------------------------------------------------------------------------------
//  <copyright file="Validator.cs" company="Business Management System Ltd.">
//      Copyright "2023" (c), Business Management System Ltd.
//      All rights reserved.
//  </copyright>
//  <author>Nikolay.Kostadinov</author>
// ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Shared;

using System.Text.RegularExpressions;
using Common.Extensions;
using static Common.Constants.GlobalConstants;

public static class Validator
{
    public const bool Exclusive = false;
    public const bool Inclusive = true;

    public static Func<bool> Between<T>(T number, T min, bool isMinInclusive, T max, bool isMaxInclusive)
        where T : IComparable<T>
    {
        return () => new { isMinInclusive, isMaxInclusive } switch
        {
            { isMinInclusive: true, isMaxInclusive: true } => min.CompareTo(number) <= 0 && max.CompareTo(number) >= 0,
            { isMinInclusive: true, isMaxInclusive: false } => min.CompareTo(number) <= 0 && max.CompareTo(number) > 0,
            { isMinInclusive: false, isMaxInclusive: true } => min.CompareTo(number) < 0 && max.CompareTo(number) >= 0,
            { isMinInclusive: false, isMaxInclusive: false } => min.CompareTo(number) < 0 && max.CompareTo(number) > 0,
            _ => false
        };
    }

    public static Func<bool> BetweenInclusive<T>(T number, T min, T max)
        where T : IComparable<T>
    {
        return Between(number, min, Inclusive, max, Inclusive);
    }

    public static Func<bool> BetweenExclusive<T>(T number, T min, T max)
        where T : IComparable<T>
    {
        return Between(number, min, Exclusive, max, Exclusive);

    }

    public static Func<bool> HasValue<T>(T value)
        where T : IEquatable<T>
    {
        return () => value is not null && !value.Equals(default);
    }

    public static Func<bool> NotNull(object? value)
    {
        return () => value is not null;
    }

    public static Func<bool> ValidateThroughRegex(string inputField, string pattern)
    {
        return () => Regex.IsMatch(inputField, pattern);
    }

    public static Func<bool> ValidateThroughRegexEmpty(string? value, string pattern)
    {
        return () => value.NotBlanc() && Regex.IsMatch(value!, pattern);
    }

    public static Func<bool> IsUniqueCode(bool isCodeUnique)
    {
        return () => isCodeUnique;
    }

    public static Func<bool> ValidateEgn(string egn)
    {
        return () =>
        {
            if (egn.Length != 10 || !egn.All(char.IsDigit))
            {
                return false;
            }

            int sum = 0;

            for (int i = 0; i < 9; i++)
            {
                int digit = egn[i] - '0';
                sum += digit * Person.Weights[i];

                if (digit < 0 || digit > 9)
                {
                    return false;
                }
            }

            int calculatedChecksum = sum % 11;
            if (calculatedChecksum == 10)
            {
                calculatedChecksum = 0;
            }

            int actualChecksum = egn[9] - '0';
            return (calculatedChecksum == actualChecksum);
        };
    }

    public static Func<bool> IsMemberOfEnumeration<TEnum>(TEnum inputValue)
    where TEnum : struct, Enum
    {
        return () => Enum.IsDefined(inputValue);
    }

    public static Func<bool> IsNotNullAndMemberOfEnumeration<TEnum>(TEnum? inputValue)
        where TEnum : struct, Enum
    {
        if (inputValue is not null)
        {
            return () => Enum.IsDefined(inputValue.Value);
        }

        return () => true;
    }


    public static class Length
    {
        public static Func<bool> Between(string text, int minLength, int maxLength)
        {
            return Validator.Between(text.Length, minLength, Inclusive, maxLength, Inclusive);
        }

        public static Func<bool> OptionalBetween(string? text, int minLength, int maxLength)
        {
            return () => text is null
                         || Validator.Between(text!.Length, minLength, Inclusive, maxLength, Inclusive).Invoke();
        }

        public static Func<bool> Exact(string text, int length)
        {
            return () => text.Length == length;
        }

        public static Func<bool> MaxNotEmpty(string? value, int length)
        {
            return () => value.NotBlanc() && value?.Length <= length;
        }

        public static Func<bool> Max(string? value, int length)
        {
            return () => (value ?? string.Empty).Length <= length;
        }
    }

    public static Func<bool> IsValidBulgarianPhone(string phoneNumber)
    {
        var BulgarianPhoneRegex = new Regex(Phone.BulgarianPattern, RegexOptions.Compiled);

        if (string.IsNullOrWhiteSpace(phoneNumber))
            return () => false;

        // Премахваме всички спейсове, тирета и точки
        var cleanPhone = Regex.Replace(phoneNumber, @"[\s\-\.]", "");

        return () => BulgarianPhoneRegex.IsMatch(cleanPhone);
    }


    public static class Date
    {
        public static Func<bool> TodayOrLater(DateOnly? date)
        {
            if (date is not null)
            {
                return () => date >= DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
            }

            return () => true;
        }

        public static Func<bool> TodayOrLater(DateOnly date)
        {
            return () => date >= DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
        }

        public static Func<bool> TodayOrBefore(DateOnly? date)
        {
            if (date is not null)
            {
                return () => date <= DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
            }

            return () => true;
        }

        public static Func<bool> TodayOrBefore(DateOnly date)
        {
            return () => date <= DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
        }

        public static Func<bool> InFeature(DateOnly? date)
        {
            if (date is not null)
            {
                return () => date > DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
            }

            return () => true;
        }

        public static Func<bool> InFeature(DateOnly date)
        {
            return () => date > DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
        }

        public static Func<bool> InPast(DateOnly? date)
        {
            if (date is not null)
            {
                return () => date < DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
            }

            return () => true;
        }

        public static Func<bool> InPast(DateOnly date)
        {
            return () => date < DateOnly.FromDateTime(TimeProvider.System.GetUtcDateTime().ToLocalTime());
        }
    }

    public static Func<bool> MustBePositive(decimal value)
    {
        return GreaterThanOrEqual(value, 0);
    }

    public static Func<bool> GreaterThanOrEqual<T>(T value, T limit)
    where T :IComparable<T>
    {
        return () => value.CompareTo(limit) >= 0  ;
    }

    public static Func<bool> LesThanOrEqual<T>(T value, T limit)
    where T :IComparable<T>
    {
        return () => value.CompareTo(limit) <= 0  ;
    }

}
