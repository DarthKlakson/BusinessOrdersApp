using BusinessOrdersApp.API.Features.Orders.Messages.DTOs;
using BusinessOrdersApp.API.Features.Orders.Messages.Queries;
using BusinessOrdersApp.API.Features.Orders.Providers;
using MediatR;

namespace BusinessOrdersApp.API.Features.Orders.Handlers.Queries
{
    public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailsDto?>
    {
        private readonly IOrderProvider _orderProvider;

        public GetOrderByIdHandler(IOrderProvider orderProvider)
        {
            _orderProvider = orderProvider;
        }

        public async Task<OrderDetailsDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await _orderProvider.GetByIdAsync(request.Id, cancellationToken);

            if (order is null)
            {
                return null;
            }

            return new OrderDetailsDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                ClientId = order.ClientId,
                ClientName = order.Client?.Name ?? string.Empty,
                ClientEmail = order.Client?.Email ?? string.Empty,
                ClientPhone = order.Client?.Phone ?? string.Empty,
                ClientAddress = order.Client?.Address ?? string.Empty,
                Items = order.OrderItems.Select(item => new OrderItemDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.Product?.Name ?? string.Empty,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    LineTotal = item.Quantity * item.UnitPrice
                }).ToList()
            };
        }
    }
}