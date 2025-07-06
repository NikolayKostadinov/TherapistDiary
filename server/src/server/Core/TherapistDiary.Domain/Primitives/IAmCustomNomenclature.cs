// ------------------------------------------------------------------------------------------------
//  <copyright file="IAmCustomNomenclature.cs" company="Business Management System Ltd.">
//      Copyright "2023" (c), Business Management System Ltd.
//      All rights reserved.
//  </copyright>
//  <author>Kosta.Kiryazov</author>
// ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Primitives;

public interface IAmCustomNomenclature
{
    string Code { get; }
    string? DescriptionBg { get; }
    string? DescriptionEn { get; }
    bool IsInUse { get; }
}