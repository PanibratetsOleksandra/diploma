using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
 
        public class Article
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Category { get; set; } // Care Tips, Inspiration, Behind the Scenes
            public string Author { get; set; } = "Sasha Panibratets";
            public string ReadTime { get; set; } = "5 min read";
            public string ImageUrl { get; set; }
            public string Intro { get; set; }

            public string ParagraphsText { get; set; } // параграфи розділені знаком "|"
            public string? BulletsText { get; set; }      // поради розділені знаком "|"
            public string? Quote { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        }
    
}
