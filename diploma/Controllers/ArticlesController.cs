using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using diploma.core.Entities;
using diploma.dal;
using diploma.core.DTOs;
using Microsoft.AspNetCore.Authorization;
using diploma.core;
namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArticlesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<IActionResult> Create([FromForm] ArticleDto dto, IFormFile? imageFile)
        {
            var article = new Article
            {
                Title = dto.Title,
                Category = dto.Category,
                Author = dto.Author,
                ReadTime = dto.ReadTime,
                Intro = dto.Intro,
                ParagraphsText = dto.ParagraphsText,
                BulletsText = dto.BulletsText,
                Quote = dto.Quote,
                CreatedAt = DateTime.UtcNow
            };

   
            if (imageFile != null && imageFile.Length > 0)
            {
            
                var blogFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "blog");

          
                if (!Directory.Exists(blogFolder))
                {
                    Directory.CreateDirectory(blogFolder);
                }

    
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(imageFile.FileName);
                var filePath = Path.Combine(blogFolder, uniqueFileName);

  
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

       
                article.ImageUrl = $"/images/blog/{uniqueFileName}";
            }
            else
            {
     
                article.ImageUrl = "/images/blog/default-blog.jpg";
            }

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return Ok(article);
        }

   
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var articles = await _context.Articles
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(articles);
        }

 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();
            return Ok(article);
        }

    
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<IActionResult> Delete(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();

     
            if (!string.IsNullOrEmpty(article.ImageUrl) && !article.ImageUrl.Contains("default-blog"))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", article.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Статтю успішно видалено" });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<IActionResult> Update(int id, [FromForm] ArticleDto dto, IFormFile? imageFile)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();

        
            article.Title = dto.Title;
            article.Category = dto.Category;
            article.Author = dto.Author;
            article.ReadTime = dto.ReadTime;
            article.Intro = dto.Intro;
            article.ParagraphsText = dto.ParagraphsText;
            article.BulletsText = dto.BulletsText;
            article.Quote = dto.Quote;

     
            if (imageFile != null && imageFile.Length > 0)
            {
               
                if (!string.IsNullOrEmpty(article.ImageUrl) && !article.ImageUrl.Contains("default-blog"))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", article.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }

             
                var blogFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "blog");
                if (!Directory.Exists(blogFolder))
                    Directory.CreateDirectory(blogFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(imageFile.FileName);
                var filePath = Path.Combine(blogFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                article.ImageUrl = $"/images/blog/{uniqueFileName}";
            }
            

            await _context.SaveChangesAsync();
            return Ok(article);
        }



    }





}