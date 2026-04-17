namespace BusinessOrdersApp.API.Features.Orders.Messages.DTOs
{
    public class UpdateOrderItemsRequestDto
    {
        public List<CreateOrderItemRequestDto> Items { get; set; } = new();
    }
}
