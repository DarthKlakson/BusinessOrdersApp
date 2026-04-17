using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnitsOfMeasurementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UnitsOfMeasurementController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var items = await _context.UnitsOfMeasurement.AsNoTracking().OrderBy(x => x.Name).ToListAsync(cancellationToken);
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var item = await _context.UnitsOfMeasurement.FindAsync([id], cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UnitOfMeasurement unit, CancellationToken cancellationToken)
        {
            _context.UnitsOfMeasurement.Add(unit);
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(unit);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UnitOfMeasurement unit, CancellationToken cancellationToken)
        {
            var existing = await _context.UnitsOfMeasurement.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            existing.Name = unit.Name;
            existing.Symbol = unit.Symbol;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.UnitsOfMeasurement.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            _context.UnitsOfMeasurement.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
