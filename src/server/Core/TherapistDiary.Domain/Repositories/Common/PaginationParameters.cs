namespace TherapistDiary.Domain.Repositories.Common;

using Resources;
using Shared;
using static TherapistDiary.Common.Constants.GlobalConstants;

public class PaginationParameters
{
    public int PageNumber{get;init;}
    public int PageSize{get;init;}
    public string? SearchTerm{get;init;}
    public string? SortBy{get;init;}
    public bool SortDescending{get;init;}
    
    private const int DefaultPageSize = 10;

    private PaginationParameters(int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        SearchTerm = searchTerm;
        SortBy = sortBy;
        SortDescending = sortDescending;
    }

    public static Result<PaginationParameters> Create(
        int pageNumber = 1,
        int pageSize = DefaultPageSize,
        string? searchTerm = null,
        string? sortBy = null,
        bool sortDescending = false)
    {
        return Result.Success(new PaginationParameters(pageNumber, pageSize, searchTerm, sortBy, sortDescending))
            .Validate(()=>pageNumber > Page.MinPageNumber, Error.Create(
                message: string.Format(ErrorMessages.PAGE_NUMBER_MUST_BE_GREATER_THAN, Page.MinPageNumber),
                field: nameof(PageNumber)))
            .Validate(Validator.BetweenInclusive(pageNumber, Page.MinPageSize, Page.MaxPageSize), Error.Create(
                message: string.Format(ErrorMessages.INVALID_NUMBER_VALUE, Page.MinPageNumber, Page.MaxPageSize),
                field: nameof(PageNumber)));
    }
    
}
