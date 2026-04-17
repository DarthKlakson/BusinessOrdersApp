using BusinessOrdersApp.API.Features.Products.Messages.DTOs;
using BusinessOrdersApp.API.Models;
using Mapster;

namespace BusinessOrdersApp.API.Features.Products.Mappings
{
    public class ProductsMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Product, ProductDto>();
        }
    }
}