public class Order
{
    public int Id { get; set; }
    public string? UserId { get; set; }// Хто замовив
    public string CustomerEmail { get; set; }
    public string CustomerPhone { get; set; }
    public string CustomerFullName { get; set; }

    // Дані доставки (можна зберігати JSON-рядком або окремими полями)
    public string ShippingDetails { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";

    // Список товарів у замовленні
    public List<OrderItem> Items { get; set; }
}

public class OrderItem
{
    public int Id { get; set; }
    public int? OrderId { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } // product, manual-design, ai-design
    public string Size { get; set; }
    public string? Notes { get; set; } // Твої правки!
    public string ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}