using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Features.Clients.Providers
{
    public class ClientProvider : IClientProvider
    {
        private readonly ApplicationDbContext _context;

        public ClientProvider(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<List<Client>> GetAllAsync(CancellationToken cancellationToken)
        {
            return _context.Clients
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }
    }
}