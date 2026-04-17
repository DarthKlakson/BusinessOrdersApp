using BusinessOrdersApp.API.Models;

namespace BusinessOrdersApp.API.Features.Products.Providers
{
    public interface IProductProvider
    {
        Task<List<Product>> GetAllAsync(CancellationToken cancellationToken);
    }
}