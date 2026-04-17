using BusinessOrdersApp.API.Features.Products.Messages.DTOs;
using MediatR;

namespace BusinessOrdersApp.API.Features.Products.Messages.Commands
{
    public class CreateProductCommand : IRequest<ProductDto>
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public int MinimumStockLevel { get; set; }
    }
}
