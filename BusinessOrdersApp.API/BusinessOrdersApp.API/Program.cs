using BusinessOrdersApp.API.Models.Data;
using Microsoft.EntityFrameworkCore;
using BusinessOrdersApp.API.Features.Products.Providers;
using BusinessOrdersApp.API.Features.Clients.Providers;
using BusinessOrdersApp.API.Features.Dashboard.Providers;
using Mapster;
using MediatR;
using BusinessOrdersApp.API.Features.Orders.Providers;
using System.Reflection;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

builder.Services.AddTransient<IProductProvider, ProductProvider>();
builder.Services.AddTransient<IClientProvider, ClientProvider>();
builder.Services.AddTransient<IOrderProvider, OrderProvider>();
builder.Services.AddTransient<IDashboardProvider, DashboardProvider>();


TypeAdapterConfig.GlobalSettings.Scan(Assembly.GetExecutingAssembly());


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    DbSeeder.Seed(dbContext);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
