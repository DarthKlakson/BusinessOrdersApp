using BusinessOrdersApp.API.Features.Products.Messages.DTOs;
using MediatR;

namespace BusinessOrdersApp.API.Features.Products.Messages.Queries
{
    public class GetAllProductsQuery : IRequest<IEnumerable<ProductDto>>
    {
    }
}