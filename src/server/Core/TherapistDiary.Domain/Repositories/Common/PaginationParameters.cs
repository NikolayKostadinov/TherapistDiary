namespace TherapistDiary.Domain.Repositories.Common;

using static TherapistDiary.Common.Constants.GlobalConstants;

public class PaginationParameters
{
    // private int _pageSize;
    // private int _pageNumber;
    //
    // public int PageNumber
    // {
    //     get => _pageNumber;
    //     set
    //     {
    //         _pageNumber = value switch
    //         {
    //             < Page.MinPageNumber => Page.MinPageNumber,
    //             _ => value
    //         };
    //     }
    // }
    //
    // public int PageSize
    // {
    //     get => _pageSize;
    //     private init
    //     {
    //         _pageSize = value switch
    //         {
    //             > Page.MaxPageSize => Page.MaxPageSize,
    //             < Page.MinPageSize => Page.MinPageSize,
    //             _ => value
    //         };
    //     }
    // }

    public int  PageSize { get; set; }
    public int  PageNumber { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public bool? SortDescending { get; set; }

    public PaginationParameters()
    {
    }

    public PaginationParameters(int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool? sortDescending)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        SearchTerm = searchTerm;
        SortBy = sortBy;
        SortDescending = sortDescending;
    }
}
