namespace TherapistDiary.Application.Common.Models;

public class PagedResult<T>
{
    public PagedResult(List<T> items, int totalCount, int page, int pageSize, int totalPages, bool hasNextPage, bool hasPreviousPage)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
        TotalPages = totalPages;
        HasNextPage = hasNextPage;
        HasPreviousPage = hasPreviousPage;
    }

    public List<T> Items { get; init; }
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public bool HasNextPage { get; init; }
    public bool HasPreviousPage { get; init; }
}
