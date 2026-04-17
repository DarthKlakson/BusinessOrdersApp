namespace BusinessOrdersApp.API.Features.Orders.Messages.DTOs
{
    public class CreateOrderRequestDto
    {
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ClientId { get; set; }
        public List<CreateOrderItemRequestDto> Items { get; set; } = new();
    }
}
