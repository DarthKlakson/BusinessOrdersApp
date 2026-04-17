namespace BusinessOrdersApp.API.Features.Dashboard.Messages.DTOs
{
    public class DashboardDto
    {
        public int ProductsCount { get; set; }
        public int ClientsCount { get; set; }
        public int OrdersCount { get; set; }
        public int NewOrdersCount { get; set; }
        public int CompletedOrdersCount { get; set; }
        public int LowStockProductsCount { get; set; }
    }
}