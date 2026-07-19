// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ProductQuery } from '../api/products';
import { Product } from '../types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductQuery) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (term: string) => [...productKeys.all, 'search', term] as const,
};

// Get all products with filters
export const useProducts = (query?: ProductQuery) => {
  return useQuery({
    queryKey: productKeys.list(query || {}),
    queryFn: () => productsApi.getProducts(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Search products
export const useProductSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: productKeys.search(searchTerm),
    queryFn: () => productsApi.searchProducts(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Example mutation (if you have admin features to create/update products)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProduct: Omit<Product, 'id'>) => {
      // This would be: apiClient.post('/products', newProduct)
      return Promise.resolve({ ...newProduct, id: Date.now().toString() });
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => {
      // This would be: apiClient.put(`/products/${id}`, data)
      return Promise.resolve({ id, ...data } as Product);
    },
    onSuccess: (data) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_id: string) => {
      // This would be: apiClient.delete(`/products/${id}`)
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};