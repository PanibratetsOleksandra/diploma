using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
    public class AppUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? MiddleName { get; set; }

        public string? Nickname { get; set; }

        public DateTime? BirthDate { get; set; }

 
        public string? Gender { get; set; }

        public string? AvatarUrl { get; set; }

        public string? FullName { get; set; }
    }
}
