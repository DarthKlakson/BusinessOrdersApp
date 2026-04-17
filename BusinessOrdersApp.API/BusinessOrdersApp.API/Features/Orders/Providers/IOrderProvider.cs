using BusinessOrdersApp.API.Models;

namespace BusinessOrdersApp.API.Features.Orders.Providers
{
    public interface IOrderProvider
    {
        Task<List<Order>> GetAllAsync(CancellationToken cancellationToken);
        Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken);
    }
}