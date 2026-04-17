using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var items = await _context.OrderItems.AsNoTracking()
                .OrderBy(x => x.OrderId).ThenBy(x => x.Id)
                .ToListAsync(cancellationToken);
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var item = await _context.OrderItems.FindAsync([id], cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItem orderItem, CancellationToken cancellationToken)
        {
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(orderItem);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderItem orderItem, CancellationToken cancellationToken)
        {
            var existing = await _context.OrderItems.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            existing.OrderId = orderItem.OrderId;
            existing.ProductId = orderItem.ProductId;
            existing.Quantity = orderItem.Quantity;
            existing.UnitPrice = orderItem.UnitPrice;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.OrderItems.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            _context.OrderItems.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
