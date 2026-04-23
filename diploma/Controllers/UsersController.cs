using diploma.core.DTOs;
using diploma.core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace diploma.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
     //[Authorize(Roles = "Admin")] 
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;

        public UsersController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.FullName
                })
                .ToListAsync();

            return Ok(users);
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            // Забороняємо видаляти самого себе (якщо ти зайшла як адмін)
            // if (user.Email == User.FindFirstValue(ClaimTypes.Email)) return BadRequest("Ви не можете видалити себе");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest("Не вдалося видалити користувача");

            return NoContent();
        }

        [HttpPost("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLock(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            // Якщо користувач не заблокований (або дата блокування вже минула)
            if (user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow)
            {
                // Блокуємо назавжди (до 2099 року)
                await _userManager.SetLockoutEndDateAsync(user, new DateTimeOffset(new DateTime(2099, 1, 1)));
                return Ok(new { isLocked = true });
            }
            else
            {
                // Розблоковуємо (ставимо поточну дату або null)
                await _userManager.SetLockoutEndDateAsync(user, null);
                return Ok(new { isLocked = false });
            }
        }
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<object>> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.PhoneNumber,
                user.UserName,
                user.Nickname,
                user.FirstName,
                user.LastName,
                user.MiddleName,
                user.BirthDate,
                user.Gender,
                user.AvatarUrl
            });
        }


        //[HttpPut("profile")]
        //[Authorize]
        //public async Task<IActionResult> UpdateProfile(UserUpdateDto model)
        //{
        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //    var user = await _userManager.FindByIdAsync(userId);
        //    if (user == null) return NotFound();

        //    user.FirstName = model.FirstName;
        //    user.LastName = model.LastName;
        //    user.MiddleName = model.MiddleName;
        //    user.Nickname = model.Nickname;
        //    user.BirthDate = model.BirthDate;
        //    user.Gender = model.Gender;

        //    var result = await _userManager.UpdateAsync(user);
        //    if (!result.Succeeded) return BadRequest(result.Errors);

        //    return Ok(user);
        //}


        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            // Оновлюємо текстові поля
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.MiddleName = model.MiddleName;
            user.Nickname = model.Nickname;
            user.PhoneNumber = model.PhoneNumber; // Зберігаємо телефон
            user.BirthDate = model.BirthDate;
            user.Gender = model.Gender;

            // Обробка фото
            if (model.Photo != null && model.Photo.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/users");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                // Видаляємо старе фото, якщо воно не дефолтне
                if (!string.IsNullOrEmpty(user.AvatarUrl) && !user.AvatarUrl.Contains("default"))
                {
                    var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                }

                var fileName = $"{userId}_{DateTime.Now.Ticks}{Path.GetExtension(model.Photo.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.Photo.CopyToAsync(stream);
                }

                user.AvatarUrl = $"/images/users/{fileName}";
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(user);
        }

    }
}