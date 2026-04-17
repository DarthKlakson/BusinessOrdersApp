using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SuppliersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var items = await _context.Suppliers.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellationToken);
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var item = await _context.Suppliers.FindAsync([id], cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Supplier supplier, CancellationToken cancellationToken)
        {
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(supplier);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Supplier supplier, CancellationToken cancellationToken)
        {
            var existing = await _context.Suppliers.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            existing.Name = supplier.Name;
            existing.Email = supplier.Email;
            existing.Phone = supplier.Phone;
            existing.Address = supplier.Address;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.Suppliers.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            _context.Suppliers.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
