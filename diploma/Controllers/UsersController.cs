using diploma.core;
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

    public class UsersController(UserManager<AppUser> userManager) : ControllerBase
    {

        [HttpGet("profile")]
        [Authorize(Roles = $"{Roles.ADMIN},{Roles.USER}")]
        public async Task<ActionResult<object>> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await userManager.FindByIdAsync(userId);
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


        [HttpGet]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {

            var users = await userManager.Users
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

        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.ADMIN)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var result = await userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest("Не вдалося видалити користувача");

            return NoContent();
        }

      
        [HttpPut("profile")]
        [Authorize(Roles = $"{Roles.ADMIN},{Roles.USER}")]
        public async Task<IActionResult> UpdateProfile([FromForm] UserUpdateDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.MiddleName = model.MiddleName;
            user.Nickname = model.Nickname;
            user.PhoneNumber = model.PhoneNumber;
            user.BirthDate = model.BirthDate;
            user.Gender = model.Gender;

            if (model.Photo != null && model.Photo.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/users");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

  
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

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(user);
        }

    }
}