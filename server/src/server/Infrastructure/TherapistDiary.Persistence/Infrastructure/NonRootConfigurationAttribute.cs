namespace TherapistDiary.Persistence.Infrastructure;

using System;

/// <summary>
/// Solves the problem with concrete entities configurations in
/// many types to single table scenario
/// </summary>
/// <seealso cref="System.Attribute" />
[AttributeUsage(AttributeTargets.Class)]
public class NonRootConfigurationAttribute : Attribute
{
}
