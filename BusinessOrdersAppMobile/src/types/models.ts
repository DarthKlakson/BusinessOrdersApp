export type DashboardDto = {
  productsCount: number;
  clientsCount: number;
  ordersCount: number;
  newOrdersCount: number;
  completedOrdersCount: number;
  lowStockProductsCount: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  supplier: string;
  price: number;
  quantityInStock: number;
  minimumStockLevel: number;
};

export type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Order = {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  clientName: string;
};

export type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDetails = {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: OrderItem[];
};

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type UnitOfMeasurement = {
  id: number;
  name: string;
  symbol: string;
};

export type Worker = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
};

export type Supplier = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};
