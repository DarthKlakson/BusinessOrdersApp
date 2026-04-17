using MediatR;

namespace BusinessOrdersApp.API.Features.Orders.Messages.Commands
{
    public class UpdateOrderStatusCommand : IRequest<UpdateOrderStatusResult>
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
