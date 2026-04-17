using BusinessOrdersApp.API.Features.Clients.Messages.DTOs;
using BusinessOrdersApp.API.Features.Clients.Messages.Queries;
using BusinessOrdersApp.API.Features.Clients.Providers;
using Mapster;
using MediatR;

namespace BusinessOrdersApp.API.Features.Clients.Handlers.Queries
{
    public class GetAllClientsHandler : IRequestHandler<GetAllClientsQuery, IEnumerable<ClientDto>>
    {
        private readonly IClientProvider _clientProvider;

        public GetAllClientsHandler(IClientProvider clientProvider)
        {
            _clientProvider = clientProvider;
        }

        public async Task<IEnumerable<ClientDto>> Handle(GetAllClientsQuery request, CancellationToken cancellationToken)
        {
            var clients = await _clientProvider.GetAllAsync(cancellationToken);
            return clients.Adapt<IEnumerable<ClientDto>>();
        }
    }
}