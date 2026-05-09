// ArticlesController.cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;
using diploma.core.Entities;
using diploma.dal;
using diploma.core.DTOs;

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

            // 📸 Зберігаємо фотографію безпосередньо у твою папку wwwroot/images/blog/
            if (imageFile != null && imageFile.Length > 0)
            {
                // Формуємо повний шлях до твоєї папки "wwwroot/images/blog"
                var blogFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "blog");

                // Про всяк випадок перевіряємо, чи існує папка (якщо ні — створимо її)
                if (!Directory.Exists(blogFolder))
                {
                    Directory.CreateDirectory(blogFolder);
                }

                // Генеруємо унікальне ім'я файлу, щоб не перезаписати фотки з однаковими назвами
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(imageFile.FileName);
                var filePath = Path.Combine(blogFolder, uniqueFileName);

                // Записуємо фізичний файл на диск комп'ютера
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                // Шлях, який ми віддамо фронтенду для тегу <img [src]="...">
                article.ImageUrl = $"/images/blog/{uniqueFileName}";
            }
            else
            {
                // Заглушка за замовчуванням, якщо статтю створили без фотографії
                article.ImageUrl = "/images/blog/default-blog.jpg";
            }

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return Ok(article);
        }

        // Отримати всі статті
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var articles = await _context.Articles
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(articles);
        }

        // Отримати статтю за ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();
            return Ok(article);
        }

        // Видалити статтю
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();

            // Якщо ми видаляємо статтю, гарним тоном буде видалити і її файл з диска
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
        public async Task<IActionResult> Update(int id, [FromForm] ArticleDto dto, IFormFile? imageFile)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null) return NotFound();

            // Оновлюємо текстові поля
            article.Title = dto.Title;
            article.Category = dto.Category;
            article.Author = dto.Author;
            article.ReadTime = dto.ReadTime;
            article.Intro = dto.Intro;
            article.ParagraphsText = dto.ParagraphsText;
            article.BulletsText = dto.BulletsText;
            article.Quote = dto.Quote;

            // Якщо завантажили нове фото — замінюємо
            if (imageFile != null && imageFile.Length > 0)
            {
                // Видаляємо старе фото з диска
                if (!string.IsNullOrEmpty(article.ImageUrl) && !article.ImageUrl.Contains("default-blog"))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", article.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath))
                        System.IO.File.Delete(oldPath);
                }

                // Зберігаємо нове
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
            // Якщо нового файлу нема — imageUrl залишається як є

            await _context.SaveChangesAsync();
            return Ok(article);
        }



    }





}