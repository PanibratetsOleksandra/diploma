namespace diploma.core.Entities
{
    public class NewsletterSubscriber
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    }
}