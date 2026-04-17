using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Features.Orders.Providers
{
    public class OrderProvider : IOrderProvider
    {
        private readonly ApplicationDbContext _context;

        public OrderProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<List<Order>> GetAllAsync(CancellationToken cancellationToken)
        {
            return _context.Orders
                .AsNoTracking()
                .Include(o => o.Client)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        public Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return _context.Orders
                .AsNoTracking()
                .Include(o => o.Client)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        }
    }
}