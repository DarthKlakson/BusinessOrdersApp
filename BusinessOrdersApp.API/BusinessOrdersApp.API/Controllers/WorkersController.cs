using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var items = await _context.Workers.AsNoTracking()
                .OrderBy(x => x.LastName).ThenBy(x => x.FirstName)
                .ToListAsync(cancellationToken);
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var item = await _context.Workers.FindAsync([id], cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Worker worker, CancellationToken cancellationToken)
        {
            _context.Workers.Add(worker);
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(worker);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Worker worker, CancellationToken cancellationToken)
        {
            var existing = await _context.Workers.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            existing.FirstName = worker.FirstName;
            existing.LastName = worker.LastName;
            existing.Email = worker.Email;
            existing.Position = worker.Position;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.Workers.FindAsync([id], cancellationToken);
            if (existing is null) return NotFound();

            _context.Workers.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
