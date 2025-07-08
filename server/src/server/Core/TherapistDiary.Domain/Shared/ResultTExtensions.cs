namespace TherapistDiary.Domain.Shared;

using Errors;
using TherapistDiary.Common.Extensions;

public static class ResultTExtensions
{
    public static Result<TOut> ValidateBase<TOut>(this Result<TOut> result, Operations operation)
        where TOut : IHaveBaseValidator
    {
        if (result.IsFailure) return result;

        var counterpartyResult = result.Value.ValidateBase(operation);
        counterpartyResult.Errors.ForEach(error => result.AddError(error));

        return result;
    }
}
