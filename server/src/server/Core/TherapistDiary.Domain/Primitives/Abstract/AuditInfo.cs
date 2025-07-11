// ------------------------------------------------------------------------------------------------
//   <copyright file="AuditInfo.cs" company="Business Management System Ltd.">
//       Copyright "2018" (c), Business Management System Ltd.
//       All rights reserved.
//   </copyright>
//   <author>Nikolay.Kostadinov</author>
//  ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Primitives.Abstract
{
    #region Using

    using System;
    using System.ComponentModel.DataAnnotations.Schema;

    #endregion

    public abstract class AuditInfo : Entity<Guid>, IAuditableEntity
    {
        protected AuditInfo() :this(Guid.CreateVersion7()) { }

        protected AuditInfo(Guid id) 
            : base(id)
        {
            Id = id;
        }
        public DateTime CreatedOn { get; set; }

        /// <summary>
        ///     Specifies whether or not the CreatedOn property should be automatically set.
        /// </summary>
        [NotMapped]
        public bool PreserveCreatedOn { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public string CreatedFrom { get; set; } = null!;

        public string? ModifiedFrom { get; set; }
    }
}
