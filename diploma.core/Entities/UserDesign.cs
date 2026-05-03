using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
    public class UserDesign
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string FrontImageUrl { get; set; } = null!; 
        public string BackImageUrl { get; set; } = null!;  
        public string GarmentType { get; set; } = null!;  
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
