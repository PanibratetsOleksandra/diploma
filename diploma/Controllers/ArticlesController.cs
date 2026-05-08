//using diploma.core.Entities;
//using diploma.dal;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using System.Threading.Tasks;

//namespace diploma.api.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class ArticlesController : ControllerBase
//    {
//        private readonly AppDbContext _context;

//        public ArticlesController(AppDbContext context)
//        {
//            _context = context;
//        }

//        // Отримати всі статті (для блогу та адмінки)
//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            var articles = await _context.Articles
//                .OrderByDescending(a => a.CreatedAt)
//                .ToListAsync();
//            return Ok(articles);
//        }

//        // Отримати одну статтю за ID
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            var article = await _context.Articles.FindAsync(id);
//            if (article == null) return NotFound();
//            return Ok(article);
//        }

//        // Створити статтю (Тільки для адміна)
//        [HttpPost]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> Create([FromBody] Article article)
//        {
//            _context.Articles.Add(article);
//            await _context.SaveChangesAsync();
//            return Ok(article);
//        }

//        // Видалити статтю
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            var article = await _context.Articles.FindAsync(id);
//            if (article == null) return NotFound();

//            _context.Articles.Remove(article);
//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Статтю видалено" });
//        }
//    }
//}