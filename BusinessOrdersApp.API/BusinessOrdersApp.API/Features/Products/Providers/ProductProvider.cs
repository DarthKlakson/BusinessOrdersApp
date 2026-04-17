using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Features.Products.Providers
{
    public class ProductProvider : IProductProvider
    {
        private readonly ApplicationDbContext _context;

        public ProductProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<List<Product>> GetAllAsync(CancellationToken cancellationToken)
        {
            return _context.Products
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync(cancellationToken);
        }
    }
}