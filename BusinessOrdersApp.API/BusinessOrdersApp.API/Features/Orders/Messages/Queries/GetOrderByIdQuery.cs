using BusinessOrdersApp.API.Features.Orders.Messages.DTOs;
using MediatR;

namespace BusinessOrdersApp.API.Features.Orders.Messages.Queries
{
    public class GetOrderByIdQuery : IRequest<OrderDetailsDto?>
    {
        public int Id { get; set; }
    }
}