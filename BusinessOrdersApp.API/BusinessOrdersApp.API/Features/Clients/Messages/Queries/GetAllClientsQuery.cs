using BusinessOrdersApp.API.Features.Clients.Messages.DTOs;
using MediatR;

namespace BusinessOrdersApp.API.Features.Clients.Messages.Queries
{
    public class GetAllClientsQuery : IRequest<IEnumerable<ClientDto>>
    {
    }
}