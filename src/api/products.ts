/// src/api/products.ts
// import { apiClient } from '../lib/api-client'; // Uncomment when using real API
import { Product } from '../types';

// Mock data for development - replace with real API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'High-quality wireless headphones with noise cancellation',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    description: 'Feature-rich smartwatch with health tracking',
  },
  {
    id: '3',
    name: 'Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    description: 'Ergonomic aluminum laptop stand',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    description: 'RGB mechanical keyboard with custom switches',
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
    description: 'Ergonomic wireless mouse with precision tracking',
  },
  {
    id: '6',
    name: 'USB-C Hub',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
    description: 'Multi-port USB-C hub with HDMI and SD card reader',
  },
];

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export const productsApi = {
  // Get all products with optional filters
  getProducts: async (query?: ProductQuery): Promise<ProductsResponse> => {
    // Mock implementation - replace with real API call
    // return apiClient.get<ProductsResponse>('/products', { params: query });

    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    let filtered = [...MOCK_PRODUCTS];

    // Apply search filter
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply price filter
    if (query?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= query.minPrice!);
    }
    if (query?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= query.maxPrice!);
    }

    // Apply sorting
    if (query?.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (query.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          default:
            comparison = 0;
        }
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const page = query?.page || 1;
    const pageSize = query?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      products: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    // Mock implementation
    // return apiClient.get<Product>(`/products/${id}`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) {
      throw {
        message: 'Product not found',
        status: 404,
      };
    }

    return product;
  },

  // Search products
  searchProducts: async (searchTerm: string): Promise<Product[]> => {
    // Mock implementation
    // return apiClient.get<Product[]>(`/products/search?q=${searchTerm}`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const searchLower = searchTerm.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    );
  },
};