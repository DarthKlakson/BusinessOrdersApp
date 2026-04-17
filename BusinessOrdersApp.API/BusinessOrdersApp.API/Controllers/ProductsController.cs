using BusinessOrdersApp.API.Features.Products.Messages.Commands;
using BusinessOrdersApp.API.Features.Products.Messages.Queries;
using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;

        public ProductsController(IMediator mediator, ApplicationDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllProductsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            return product is null ? NotFound() : Ok(product);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product, CancellationToken cancellationToken)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            existing.Name = product.Name;
            existing.Category = product.Category;
            existing.Unit = product.Unit;
            existing.Supplier = product.Supplier;
            existing.Price = product.Price;
            existing.QuantityInStock = product.QuantityInStock;
            existing.MinimumStockLevel = product.MinimumStockLevel;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            _context.Products.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
