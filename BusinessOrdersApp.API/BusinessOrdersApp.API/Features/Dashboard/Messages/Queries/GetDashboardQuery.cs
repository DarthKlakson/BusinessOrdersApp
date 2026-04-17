using BusinessOrdersApp.API.Features.Dashboard.Messages.DTOs;
using MediatR;

namespace BusinessOrdersApp.API.Features.Dashboard.Messages.Queries
{
    public class GetDashboardQuery : IRequest<DashboardDto>
    {
    }
}