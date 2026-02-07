using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
    public class ProductPhoto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; } // Головне фото для прев'ю
        public int ProductId { get; set; }
    }
}
