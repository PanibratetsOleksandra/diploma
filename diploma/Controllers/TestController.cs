using Microsoft.AspNetCore.Mvc;
[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
	[HttpGet]
	public IActionResult Get()
	{
		return Ok(new { message = "Hello from .NET 9 API" });
	}

	[HttpPost]
	public IActionResult Post([FromBody] Person data)
	{
		return Ok(new { received = data });
	}

}
public class Person {
	public string Name { get; set; }

}





