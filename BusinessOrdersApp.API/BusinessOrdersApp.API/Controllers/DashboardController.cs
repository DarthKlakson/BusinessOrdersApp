using BusinessOrdersApp.API.Features.Dashboard.Messages.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BusinessOrdersApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetDashboardQuery(), cancellationToken);
            return Ok(result);
        }
    }
}