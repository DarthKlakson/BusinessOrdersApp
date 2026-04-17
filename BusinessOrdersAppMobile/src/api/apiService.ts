import { API_BASE_URL } from './config';
import {
  Category,
  Client,
  DashboardDto,
  Order,
  OrderDetails,
  Product,
  Supplier,
  UnitOfMeasurement,
  Worker,
} from '../types/models';

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const text = await response.text();
    return text || `API error: ${response.status}`;
  } catch {
    return `API error: ${response.status}`;
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  getDashboard: async (): Promise<DashboardDto> => {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    return handleResponse<DashboardDto>(response);
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return handleResponse<Product[]>(response);
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse<Product>(response);
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(response);
  },

  updateProduct: async (id: number, product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...product }),
    });
    return handleResponse<Product>(response);
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getClients: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients`);
    return handleResponse<Client[]>(response);
  },

  getClientById: async (id: number): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    return handleResponse<Client>(response);
  },

  createClient: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    return handleResponse<Client>(response);
  },

  updateClient: async (id: number, client: Omit<Client, 'id'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...client }),
    });
    return handleResponse<Client>(response);
  },

  deleteClient: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return handleResponse<Order[]>(response);
  },

  getOrderById: async (id: number): Promise<OrderDetails> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse<OrderDetails>(response);
  },

  createOrder: async (order: {
    orderDate: string;
    status: string;
    clientId: number;
    items: Array<{
      productId: number;
      quantity: number;
    }>;
  }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/with-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  updateOrderStatus: async (id: number, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  updateOrderItems: async (
    id: number,
    items: Array<{
      productId: number;
      quantity: number;
    }>,
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse<Category[]>(response);
  },

  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return handleResponse<Category>(response);
  },

  updateCategory: async (id: number, category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...category }),
    });
    return handleResponse<Category>(response);
  },

  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getUnitsOfMeasurement: async (): Promise<UnitOfMeasurement[]> => {
    const response = await fetch(`${API_BASE_URL}/unitsofmeasurement`);
    return handleResponse<UnitOfMeasurement[]>(response);
  },

  createUnitOfMeasurement: async (
    unit: Omit<UnitOfMeasurement, 'id'>,
  ): Promise<UnitOfMeasurement> => {
    const response = await fetch(`${API_BASE_URL}/unitsofmeasurement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unit),
    });
    return handleResponse<UnitOfMeasurement>(response);
  },

  updateUnitOfMeasurement: async (
    id: number,
    unit: Omit<UnitOfMeasurement, 'id'>,
  ): Promise<UnitOfMeasurement> => {
    const response = await fetch(`${API_BASE_URL}/unitsofmeasurement/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...unit }),
    });
    return handleResponse<UnitOfMeasurement>(response);
  },

  deleteUnitOfMeasurement: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/unitsofmeasurement/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getWorkers: async (): Promise<Worker[]> => {
    const response = await fetch(`${API_BASE_URL}/workers`);
    return handleResponse<Worker[]>(response);
  },

  createWorker: async (worker: Omit<Worker, 'id'>): Promise<Worker> => {
    const response = await fetch(`${API_BASE_URL}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worker),
    });
    return handleResponse<Worker>(response);
  },

  updateWorker: async (id: number, worker: Omit<Worker, 'id'>): Promise<Worker> => {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...worker }),
    });
    return handleResponse<Worker>(response);
  },

  deleteWorker: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`);
    return handleResponse<Supplier[]>(response);
  },

  createSupplier: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier),
    });
    return handleResponse<Supplier>(response);
  },

  updateSupplier: async (id: number, supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...supplier }),
    });
    return handleResponse<Supplier>(response);
  },

  deleteSupplier: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }
  },
};
