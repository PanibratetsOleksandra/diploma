using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.DTOs
{
    public class ArticleDto
    {
        public string Title { get; set; }
        public string Category { get; set; }
        public string Author { get; set; }
        public string ReadTime { get; set; }
        public string Intro { get; set; }
        public string ParagraphsText { get; set; }
        public string? BulletsText { get; set; }
        public string? Quote { get; set; }
    }
}
