using BusinessOrdersApp.API.Features.Clients.Messages.DTOs;
using BusinessOrdersApp.API.Models;
using Mapster;

namespace BusinessOrdersApp.API.Features.Clients.Mappings
{
    public class ClientsMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Client, ClientDto>();
        }
    }
}