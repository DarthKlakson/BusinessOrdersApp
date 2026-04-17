using BusinessOrdersApp.API.Features.Dashboard.Messages.DTOs;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Features.Dashboard.Providers
{
    public class DashboardProvider : IDashboardProvider
    {
        private readonly ApplicationDbContext _context;

        public DashboardProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
        {
            var productsCount = await _context.Products.CountAsync(cancellationToken);
            var clientsCount = await _context.Clients.CountAsync(cancellationToken);
            var ordersCount = await _context.Orders.CountAsync(cancellationToken);
            var newOrdersCount = await _context.Orders.CountAsync(o => o.Status == "New", cancellationToken);
            var completedOrdersCount = await _context.Orders.CountAsync(o => o.Status == "Completed", cancellationToken);
            var lowStockProductsCount = await _context.Products.CountAsync(
                p => p.QuantityInStock <= p.MinimumStockLevel,
                cancellationToken);

            return new DashboardDto
            {
                ProductsCount = productsCount,
                ClientsCount = clientsCount,
                OrdersCount = ordersCount,
                NewOrdersCount = newOrdersCount,
                CompletedOrdersCount = completedOrdersCount,
                LowStockProductsCount = lowStockProductsCount
            };
        }
    }
}