using BusinessOrdersApp.API.Features.Clients.Messages.Queries;
using BusinessOrdersApp.API.Models;
using BusinessOrdersApp.API.Models.Data;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _context;

        public ClientsController(IMediator mediator, ApplicationDbContext context)
        {
            _mediator = mediator;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllClientsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var client = await _context.Clients.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            return client is null ? NotFound() : Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Client client, CancellationToken cancellationToken)
        {
            _context.Clients.Add(client);
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(client);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Client client, CancellationToken cancellationToken)
        {
            var existing = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            existing.Name = client.Name;
            existing.Email = client.Email;
            existing.Phone = client.Phone;
            existing.Address = client.Address;
            await _context.SaveChangesAsync(cancellationToken);
            return Ok(existing);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.Clients.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (existing is null) return NotFound();

            _context.Clients.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
