using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AiController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("AiController works");
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