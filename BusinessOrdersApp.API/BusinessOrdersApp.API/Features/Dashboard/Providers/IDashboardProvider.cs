using BusinessOrdersApp.API.Features.Dashboard.Messages.DTOs;

namespace BusinessOrdersApp.API.Features.Dashboard.Providers
{
    public interface IDashboardProvider
    {
        Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken);
    }
}