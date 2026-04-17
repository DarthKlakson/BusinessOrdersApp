namespace BusinessOrdersApp.API.Features.Orders.Messages.DTOs
{
    public class CreateOrderItemRequestDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
