using BusinessOrdersApp.API.Features.Products.Messages.Commands;
using BusinessOrdersApp.API.Features.Products.Messages.DTOs;
using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Mapster;
using MediatR;

namespace BusinessOrdersApp.API.Features.Products.Handlers.Commands
{
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
    {
        private readonly ApplicationDbContext _context;

        public CreateProductHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var product = new Product
            {
                Name = request.Name,
                Category = request.Category,
                Unit = request.Unit,
                Supplier = request.Supplier,
                Price = request.Price,
                QuantityInStock = request.QuantityInStock,
                MinimumStockLevel = request.MinimumStockLevel
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);

            return product.Adapt<ProductDto>();
        }
    }
}
