using diploma.core.Enums;

public class Order
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerPhone { get; set; }
    public string CustomerFullName { get; set; }


    public string ShippingDetails { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public List<OrderItem> Items { get; set; }
}

public class OrderItem
{
    public int Id { get; set; }
    public int? OrderId { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } 
    public string Size { get; set; }
    public string? Notes { get; set; }
    public string ImageUrl { get; set; } 
    public decimal Price { get; set; }
    public int Quantity { get; set; }

    public string? FrontImageUrl { get; set; }
    public string? BackImageUrl { get; set; }
}