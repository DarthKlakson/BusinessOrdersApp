using BusinessOrdersApp.API.Features.Orders.Messages.DTOs;
using BusinessOrdersApp.API.Features.Orders.Messages.Queries;
using BusinessOrdersApp.API.Features.Orders.Providers;
using MediatR;

namespace BusinessOrdersApp.API.Features.Orders.Handlers.Queries
{
    public class GetAllOrdersHandler : IRequestHandler<GetAllOrdersQuery, IEnumerable<OrderDto>>
    {
        private readonly IOrderProvider _orderProvider;

        public GetAllOrdersHandler(IOrderProvider orderProvider)
        {
            _orderProvider = orderProvider;
        }

        public async Task<IEnumerable<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = await _orderProvider.GetAllAsync(cancellationToken);

            return orders.Select(order => new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                ClientName = order.Client?.Name ?? string.Empty
            });
        }
    }
}