using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
    public class SavedDesign
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string ImageUrl { get; set; } = null!; 
        public string Prompt { get; set; } = null!;   
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
