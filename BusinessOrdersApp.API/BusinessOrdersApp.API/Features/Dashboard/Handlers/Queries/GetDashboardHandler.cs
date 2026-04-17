using BusinessOrdersApp.API.Features.Dashboard.Messages.DTOs;
using BusinessOrdersApp.API.Features.Dashboard.Messages.Queries;
using BusinessOrdersApp.API.Features.Dashboard.Providers;
using MediatR;

namespace BusinessOrdersApp.API.Features.Dashboard.Handlers.Queries
{
    public class GetDashboardHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
    {
        private readonly IDashboardProvider _dashboardProvider;

        public GetDashboardHandler(IDashboardProvider dashboardProvider)
        {
            _dashboardProvider = dashboardProvider;
        }

        public Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
        {
            return _dashboardProvider.GetDashboardAsync(cancellationToken);
        }
    }
}