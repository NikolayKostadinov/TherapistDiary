//  ------------------------------------------------------------------------------------------------
//   <copyright file="DeletableEntity.cs" company="Business Management System Ltd.">
//       Copyright "2018" (c), Business Management System Ltd. 
//       All rights reserved.
//   </copyright>
//   <author>Nikolay.Kostadinov</author>
//  ------------------------------------------------------------------------------------------------

namespace TherapistDiary.Domain.Primitives.Abstract
{
    #region Using

    using System;
    using System.ComponentModel.DataAnnotations;

    #endregion

    public abstract class DeletableEntity : AuditInfo, IDeletableEntity
    {
        [Editable(false)]
        public bool IsDeleted { get; set; }

        [Editable(false)]
        public DateTime? DeletedOn { get; set; }

        public string? DeletedFrom { get; set; }
    }
}