namespace BusinessOrdersApp.API.Models.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Biuro", Description = "Artykuly biurowe" },
                    new Category { Name = "Drukarki", Description = "Materialy do drukarek" }
                );
            }

            if (!context.UnitsOfMeasurement.Any())
            {
                context.UnitsOfMeasurement.AddRange(
                    new UnitOfMeasurement { Name = "Sztuka", Symbol = "szt." },
                    new UnitOfMeasurement { Name = "Ryza", Symbol = "ryza" }
                );
            }

            if (!context.Workers.Any())
            {
                context.Workers.AddRange(
                    new Worker
                    {
                        FirstName = "Anna",
                        LastName = "Nowak",
                        Email = "anna.nowak@firma.pl",
                        Position = "Handlowiec"
                    },
                    new Worker
                    {
                        FirstName = "Piotr",
                        LastName = "Zielinski",
                        Email = "piotr.zielinski@firma.pl",
                        Position = "Magazynier"
                    }
                );
            }

            if (!context.Suppliers.Any())
            {
                context.Suppliers.AddRange(
                    new Supplier
                    {
                        Name = "Office Supply Sp. z o.o.",
                        Email = "biuro@officesupply.pl",
                        Phone = "111222333",
                        Address = "ul. Handlowa 10, Poznan"
                    },
                    new Supplier
                    {
                        Name = "Print Expert",
                        Email = "kontakt@printexpert.pl",
                        Phone = "444555666",
                        Address = "ul. Drukarska 5, Gdansk"
                    }
                );
            }

            if (!context.Products.Any())
            {
                context.Products.AddRange(
                    new Product
                    {
                        Name = "Papier A4",
                        Category = "Biuro",
                        Unit = "ryza",
                        Price = 24.99m,
                        QuantityInStock = 120,
                        MinimumStockLevel = 20
                    },
                    new Product
                    {
                        Name = "Dlugopis niebieski",
                        Category = "Biuro",
                        Unit = "szt.",
                        Price = 3.50m,
                        QuantityInStock = 250,
                        MinimumStockLevel = 50
                    },
                    new Product
                    {
                        Name = "Toner HP 136A",
                        Category = "Drukarki",
                        Unit = "szt.",
                        Price = 289.00m,
                        QuantityInStock = 8,
                        MinimumStockLevel = 5
                    }
                );
            }

            if (!context.Clients.Any())
            {
                context.Clients.AddRange(
                    new Client
                    {
                        Name = "ABC Sp. z o.o.",
                        Email = "kontakt@abc.pl",
                        Phone = "123456789",
                        Address = "ul. Kwiatowa 1, Warszawa"
                    },
                    new Client
                    {
                        Name = "Jan Kowalski",
                        Email = "jan.kowalski@example.com",
                        Phone = "987654321",
                        Address = "ul. Lipowa 12, Krakow"
                    }
                );
            }

            context.SaveChanges();

            if (!context.Orders.Any())
            {
                var firstClient = context.Clients.First();
                var secondClient = context.Clients.Skip(1).First();

                var firstProduct = context.Products.First();
                var secondProduct = context.Products.Skip(1).First();
                var thirdProduct = context.Products.Skip(2).First();

                var order1 = new Order
                {
                    OrderDate = DateTime.UtcNow.AddDays(-2),
                    Status = "New",
                    TotalAmount = firstProduct.Price * 2 + secondProduct.Price * 10,
                    ClientId = firstClient.Id
                };

                var order2 = new Order
                {
                    OrderDate = DateTime.UtcNow.AddDays(-1),
                    Status = "Completed",
                    TotalAmount = thirdProduct.Price * 1,
                    ClientId = secondClient.Id
                };

                context.Orders.AddRange(order1, order2);
                context.SaveChanges();

                context.OrderItems.AddRange(
                    new OrderItem
                    {
                        OrderId = order1.Id,
                        ProductId = firstProduct.Id,
                        Quantity = 2,
                        UnitPrice = firstProduct.Price
                    },
                    new OrderItem
                    {
                        OrderId = order1.Id,
                        ProductId = secondProduct.Id,
                        Quantity = 10,
                        UnitPrice = secondProduct.Price
                    },
                    new OrderItem
                    {
                        OrderId = order2.Id,
                        ProductId = thirdProduct.Id,
                        Quantity = 1,
                        UnitPrice = thirdProduct.Price
                    }
                );

                context.SaveChanges();
            }
        }
    }
}
