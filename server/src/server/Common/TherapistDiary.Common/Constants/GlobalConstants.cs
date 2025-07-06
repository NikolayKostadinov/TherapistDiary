namespace TherapistDiary.Common.Constants;

public static class GlobalConstants
{
    public static class Person
    {

        public const int NameMinLength = 1;
        public const int FirstNameMaxLength = 40;
        public const int MidNameMaxLength = 40;
        public const int LastNameMaxLength = 40;
        public const string DefaultSorting = "FirstName ascending, SirName ascending, LastName ascending";
        public static readonly int[] Weights = [2, 4, 8, 5, 10, 9, 7, 3, 6];
        public static int MinAge = 1;
        public static int MaxAge = 120;
    }

    public static class Phone
    {
        public const string BulgarianPattern = @"^(\+359|0)?(87|88|89|98|99)[0-9]{7}$|^(\+359|0)?[2-9][0-9][0-9]{7}$";
    }

    public static class Page
    {
        public const int MinPageNumber = 0;
        public const int MinPageSize = 1;
        public const int MaxPageSize = 100;
    }

    public static class TherapyType
    {
        public const int NameMaxLength = 50;
        public const int BannerPictureUrlMinLength = 15;
        public const int BannerPictureUrlMaxLength = 2048;

    }

    public static class Therapy
    {
        public const int NameMaxLength = 50;
    }
}
