using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DesignerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DesignerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("save-manual-design")]
        [Authorize]
        public async Task<IActionResult> SaveManualDesign([FromBody] SaveManualRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                // Шлях до нової папки для ручних дизайнів
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/user-designs");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                // Функція для збереження сторін
                async Task<string> SaveSideImage(string base64, string side)
                {
                    if (string.IsNullOrEmpty(base64)) return string.Empty;

                    var base64Data = base64.Substring(base64.IndexOf(",") + 1);
                    var imageBytes = Convert.FromBase64String(base64Data);

                    var fileName = $"manual_{userId}_{DateTime.Now.Ticks}_{side}.png";
                    var filePath = Path.Combine(folderPath, fileName);

                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
                    return $"/images/user-designs/{fileName}";
                }

                // Зберігаємо обидві сторони
                var frontPath = await SaveSideImage(request.FrontBase64, "front");
                var backPath = await SaveSideImage(request.BackBase64, "back");

                // Створюємо запис у базі
                var userDesign = new UserDesign
                {
                    UserId = userId,
                    FrontImageUrl = frontPath,
                    BackImageUrl = backPath,
                    GarmentType = request.GarmentType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserDesigns.Add(userDesign);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Full design saved to your profile!", designId = userDesign.Id });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to save design: {ex.Message}");
            }
        }

        [HttpGet("my-manual-designs")]
        [Authorize]
        public IActionResult GetMyManualDesigns()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var designs = _context.UserDesigns
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt)
                .ToList();

            return Ok(designs);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDesign(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var design = await _context.UserDesigns.FindAsync(id);

            if (design == null) return NotFound();
            if (design.UserId != userId) return Forbid();

            // Видаляємо файли з сервера
            void DeleteFile(string? path)
            {
                if (string.IsNullOrEmpty(path)) return;
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/'));
                if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
            }

            DeleteFile(design.FrontImageUrl);
            DeleteFile(design.BackImageUrl);

            _context.UserDesigns.Remove(design);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Design deleted" });
        }
    }

    // DTO для запиту
    public class SaveManualRequest
    {
        public string FrontBase64 { get; set; } = null!;
        public string BackBase64 { get; set; } = null!;
        public string GarmentType { get; set; } = null!;
    }
}