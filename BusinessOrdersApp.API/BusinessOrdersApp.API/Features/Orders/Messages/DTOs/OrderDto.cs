namespace BusinessOrdersApp.API.Features.Orders.Messages.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string ClientName { get; set; } = string.Empty;
    }
}