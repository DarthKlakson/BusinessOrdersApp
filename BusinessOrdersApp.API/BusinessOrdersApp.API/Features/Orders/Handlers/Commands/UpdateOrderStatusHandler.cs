using BusinessOrdersApp.API.Features.Orders.Messages.Commands;
using BusinessOrdersApp.API.Models.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Features.Orders.Handlers.Commands
{
    public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, UpdateOrderStatusResult>
    {
        private readonly ApplicationDbContext _context;

        public UpdateOrderStatusHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UpdateOrderStatusResult> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (order is null)
            {
                return new UpdateOrderStatusResult
                {
                    NotFound = true,
                    ErrorMessage = "Nie znaleziono zamówienia.",
                };
            }

            var wasCompleted = order.Status == "Completed";

            if (!wasCompleted && request.Status == "Completed")
            {
                foreach (var item in order.OrderItems)
                {
                    if (item.Product is null)
                    {
                        return new UpdateOrderStatusResult
                        {
                            ErrorMessage = "Jeden z produktów w zamówieniu nie istnieje.",
                        };
                    }

                    if (item.Product.QuantityInStock < item.Quantity)
                    {
                        return new UpdateOrderStatusResult
                        {
                            ErrorMessage = $"Nie można zakończyć zamówienia. Brak wystarczającego stanu dla produktu: {item.Product.Name}.",
                        };
                    }

                    var stockAfterCompletion = item.Product.QuantityInStock - item.Quantity;
                    if (stockAfterCompletion < item.Product.MinimumStockLevel)
                    {
                        return new UpdateOrderStatusResult
                        {
                            ErrorMessage = $"Nie można zakończyć zamówienia. Produkt {item.Product.Name} spadłby poniżej minimalnego stanu ({item.Product.MinimumStockLevel}).",
                        };
                    }
                }

                foreach (var item in order.OrderItems)
                {
                    if (item.Product is not null)
                    {
                        item.Product.QuantityInStock -= item.Quantity;
                    }
                }
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync(cancellationToken);

            return new UpdateOrderStatusResult
            {
                Success = true,
            };
        }
    }
}
