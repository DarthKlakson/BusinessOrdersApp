using BusinessOrdersApp.API.Models;

namespace BusinessOrdersApp.API.Features.Clients.Providers
{
    public interface IClientProvider
    {
        Task<List<Client>> GetAllAsync(CancellationToken cancellationToken);
    }
}