using diploma.core.Entities;
using diploma.dal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;


namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;
        public AiController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
            _context = context;
        }


        [HttpGet("my-designs")]
        [Authorize]
        public IActionResult GetMyDesigns()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var designs = _context.SavedDesigns
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.ImageUrl,
                    d.Prompt,
                    d.CreatedAt
                })
                .ToList();

            return Ok(designs);
        }

        [HttpDelete("designs/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDesign(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var design = await _context.SavedDesigns.FindAsync(id);

            if (design == null)
                return NotFound("Design not found");

            if (design.UserId != userId)
                return Forbid();

            if (!string.IsNullOrWhiteSpace(design.ImageUrl))
            {
                var relativePath = design.ImageUrl.TrimStart('/');
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            _context.SavedDesigns.Remove(design);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Design deleted" });
        }

        [HttpPost("save-design")]
        [Authorize]
        public async Task<IActionResult> SaveDesign([FromBody] SaveDesignRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(request.Base64Image)) return BadRequest("No image data");

            // Конвертуємо Base64 у файл
            var base64Data = request.Base64Image.Substring(request.Base64Image.IndexOf(",") + 1);
            var imageBytes = Convert.FromBase64String(base64Data);

            var fileName = $"ai_{userId}_{DateTime.Now.Ticks}.jpg";
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/ai-designs");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);
            await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

            var savedDesign = new SavedDesign
            {
                UserId = userId!,
                ImageUrl = $"/images/ai-designs/{fileName}",
                Prompt = request.Prompt
            };

            _context.SavedDesigns.Add(savedDesign);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Design saved to your profile!" });
        }

        public class SaveDesignRequest
        {
            public string Base64Image { get; set; } = null!;
            public string Prompt { get; set; } = null!;
        }


        [HttpPost("generate-image")]
        public async Task<ActionResult> GenerateImage([FromBody] AiRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Vision))
                return BadRequest("Vision is empty");

            var apiKey = _configuration["HuggingFace:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                return BadRequest("Hugging Face API key is missing.");

            // FLUX.1-dev is shown in HF quick start for text-to-image
            var url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

            var prompt =
                $"Clean apparel design mockup for a T-shirt print. {request.Vision}. " +
                "White background, centered composition, high quality, fashion mockup, textile print design.";

            var requestBody = new
            {
                inputs = prompt
            };

            try
            {
                using var message = new HttpRequestMessage(HttpMethod.Post, url);
                message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                message.Content = JsonContent.Create(requestBody);

                var response = await _httpClient.SendAsync(message);
                var bytes = await response.Content.ReadAsByteArrayAsync();

                if (!response.IsSuccessStatusCode)
                {
                    var errorText = System.Text.Encoding.UTF8.GetString(bytes);
                    return StatusCode((int)response.StatusCode, errorText);
                }

                var base64 = Convert.ToBase64String(bytes);

                return Ok(new
                {
                    imageUrl = $"data:image/jpeg;base64,{base64}"
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"HF image generation failed: {ex.Message}");
            }
        }



        }

    public class AiRequest
    {
        public string Vision { get; set; } = string.Empty;
    }



    }

