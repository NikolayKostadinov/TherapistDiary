// ------------------------------------------------------------------------------------------------
//  <copyright file="IHaveCacheCode.cs" company="Business Management System Ltd.">
//      Copyright "2023" (c), Business Management System Ltd.
//      All rights reserved.
//  </copyright>
//  <author>Nikolay.Kostadinov</author>
// ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Primitives;

public interface IHaveCacheCode<T>
where T: IEquatable<T>
{
    T CacheCode { get; }
}