using BusinessOrdersApp.API.Features.Products.Messages.DTOs;
using BusinessOrdersApp.API.Features.Products.Messages.Queries;
using BusinessOrdersApp.API.Features.Products.Providers;
using Mapster;
using MediatR;

namespace BusinessOrdersApp.API.Features.Products.Handlers.Queries
{
    public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, IEnumerable<ProductDto>>
    {
        private readonly IProductProvider _productProvider;

        public GetAllProductsHandler(IProductProvider productProvider)
        {
            _productProvider = productProvider;
        }

        public async Task<IEnumerable<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
        {
            var products = await _productProvider.GetAllAsync(cancellationToken);
            return products.Adapt<IEnumerable<ProductDto>>();
        }
    }
}