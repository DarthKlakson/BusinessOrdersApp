using BusinessOrdersApp.API.Features.Orders.Messages.Commands;
using BusinessOrdersApp.API.Features.Orders.Messages.DTOs;
using BusinessOrdersApp.API.Features.Orders.Messages.Queries;
using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;

        public OrdersController(IMediator mediator, ApplicationDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllOrdersQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetOrderByIdQuery { Id = id }, cancellationToken);

            if (result is null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusCommand command, CancellationToken cancellationToken)
        {
            command.Id = id;

            var result = await _mediator.Send(command, cancellationToken);

            if (result.NotFound)
            {
                return NotFound();
            }

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage ?? "Nie udało się zmienić statusu zamówienia.");
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order, CancellationToken cancellationToken)
        {
            return BadRequest("Use the request format with order items.");
        }

        [HttpPost("with-items")]
        public async Task<IActionResult> CreateWithItems(
            [FromBody] CreateOrderRequestDto request,
            CancellationToken cancellationToken)
        {
            if (request is null)
            {
                return BadRequest("Request body is required.");
            }

            if (!await _context.Clients.AnyAsync(x => x.Id == request.ClientId, cancellationToken))
            {
                return BadRequest("Selected client does not exist.");
            }

            if (request.Items is null || request.Items.Count == 0)
            {
                return BadRequest("Order must contain at least one product.");
            }

            if (request.Items.Any(x => x.Quantity <= 0))
            {
                return BadRequest("Each order item must have quantity greater than zero.");
            }

            if (request.Items.Count == 0)
            {
                return BadRequest("Order must contain at least one product.");
            }

            try
            {
                var products = await LoadRequestedProductsAsync(request.Items, cancellationToken);
                if (products is null)
                {
                    return BadRequest("One or more selected products do not exist.");
                }

                if (request.Status == "Completed")
                {
                    var stockValidationError = ValidateCompletedOrderStock(request.Items, products);
                    if (stockValidationError is not null)
                    {
                        return BadRequest(stockValidationError);
                    }
                }

                var totalAmount = request.Items.Sum(item =>
                {
                    var product = products.First(x => x.Id == item.ProductId);
                    return product.Price * item.Quantity;
                });

                var order = new Order
                {
                    OrderDate = request.OrderDate,
                    Status = request.Status,
                    TotalAmount = totalAmount,
                    ClientId = request.ClientId
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(cancellationToken);

                foreach (var item in request.Items)
                {
                    var product = products.First(x => x.Id == item.ProductId);

                    _context.OrderItems.Add(new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price
                    });

                    if (request.Status == "Completed")
                    {
                        product.QuantityInStock -= item.Quantity;
                    }
                }

                await _context.SaveChangesAsync(cancellationToken);

                return Ok(new
                {
                    order.Id,
                    order.OrderDate,
                    order.Status,
                    order.TotalAmount,
                    order.ClientId,
                    Items = request.Items.Select(item =>
                    {
                        var product = products.First(x => x.Id == item.ProductId);
                        return new
                        {
                            item.ProductId,
                            ProductName = product.Name,
                            item.Quantity,
                            UnitPrice = product.Price,
                            LineTotal = product.Price * item.Quantity
                        };
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Order creation failed: {ex.Message}");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Order order, CancellationToken cancellationToken)
        {
            var existing = await _context.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            existing.OrderDate = order.OrderDate;
            existing.Status = order.Status;
            existing.TotalAmount = order.TotalAmount;
            existing.ClientId = order.ClientId;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpPut("{id:int}/items")]
        public async Task<IActionResult> UpdateItems(
            int id,
            [FromBody] UpdateOrderItemsRequestDto request,
            CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

            if (order is null)
            {
                return NotFound();
            }

            if (request.Items is null || request.Items.Count == 0)
            {
                return BadRequest("Zamówienie musi zawierać co najmniej jeden produkt.");
            }

            if (request.Items.Any(x => x.Quantity <= 0))
            {
                return BadRequest("Każda pozycja zamówienia musi mieć ilość większą od zera.");
            }

            var requestedProductIds = request.Items.Select(x => x.ProductId).Distinct().ToList();
            var requestedProducts = await LoadRequestedProductsAsync(request.Items, cancellationToken);
            if (requestedProducts is null)
            {
                return BadRequest("Jeden lub więcej wybranych produktów nie istnieje.");
            }

            var isCompleted = order.Status == "Completed";

            if (isCompleted)
            {
                foreach (var existingItem in order.OrderItems)
                {
                    if (existingItem.Product is not null)
                    {
                        existingItem.Product.QuantityInStock += existingItem.Quantity;
                    }
                }

                var stockValidationError = ValidateCompletedOrderUpdateStock(request.Items, requestedProducts);
                if (stockValidationError is not null)
                {
                    return BadRequest(stockValidationError);
                }
            }

            _context.OrderItems.RemoveRange(order.OrderItems);
            order.OrderItems.Clear();

            foreach (var item in request.Items)
            {
                var product = requestedProducts.First(x => x.Id == item.ProductId);

                order.OrderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                if (isCompleted)
                {
                    product.QuantityInStock -= item.Quantity;
                }
            }

            order.TotalAmount = request.Items.Sum(item =>
            {
                var product = requestedProducts.First(x => x.Id == item.ProductId);
                return product.Price * item.Quantity;
            });

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                order.Id,
                order.TotalAmount,
                Items = request.Items.Select(item =>
                {
                    var product = requestedProducts.First(x => x.Id == item.ProductId);
                    return new
                    {
                        item.ProductId,
                        ProductName = product.Name,
                        item.Quantity,
                        UnitPrice = product.Price,
                        LineTotal = product.Price * item.Quantity
                    };
                }).ToList()
            });
        }

        private async Task<List<Product>?> LoadRequestedProductsAsync(
            IEnumerable<CreateOrderItemRequestDto> items,
            CancellationToken cancellationToken)
        {
            var productIds = items.Select(x => x.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(x => productIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            return products.Count == productIds.Count ? products : null;
        }

        private static string? ValidateCompletedOrderStock(
            IEnumerable<CreateOrderItemRequestDto> items,
            IEnumerable<Product> products)
        {
            foreach (var item in items)
            {
                var product = products.First(x => x.Id == item.ProductId);

                if (product.QuantityInStock < item.Quantity)
                {
                    return $"Brak wystarczającego stanu dla produktu: {product.Name}.";
                }

                var stockAfterCompletion = product.QuantityInStock - item.Quantity;
                if (stockAfterCompletion < product.MinimumStockLevel)
                {
                    return $"Nie można zakończyć zamówienia. Produkt {product.Name} spadłby poniżej minimalnego stanu ({product.MinimumStockLevel}).";
                }
            }

            return null;
        }

        private static string? ValidateCompletedOrderUpdateStock(
            IEnumerable<CreateOrderItemRequestDto> items,
            IEnumerable<Product> products)
        {
            foreach (var item in items)
            {
                var product = products.First(x => x.Id == item.ProductId);

                if (product.QuantityInStock < item.Quantity)
                {
                    return $"Nie można zapisać zmian. Brak wystarczającego stanu dla produktu: {product.Name}.";
                }

                var stockAfterCompletion = product.QuantityInStock - item.Quantity;
                if (stockAfterCompletion < product.MinimumStockLevel)
                {
                    return $"Nie można zapisać zmian. Produkt {product.Name} spadłby poniżej minimalnego stanu ({product.MinimumStockLevel}).";
                }
            }

            return null;
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.Orders.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            _context.Orders.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
