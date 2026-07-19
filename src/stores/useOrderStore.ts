// src/stores/useOrderStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, Address } from '../types';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;

  // Actions
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'date'>) => void;
  getOrderById: (id: string) => Order | undefined;
  cancelOrder: (id: string) => void;
  clearOrders: () => void;
}

// Mock order data generator
const generateMockOrders = (): Order[] => {
  return [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '2024-01-15T10:30:00Z',
      status: 'delivered',
      items: [
        {
          productId: '1',
          productName: 'Wireless Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          quantity: 1,
          price: 99.99,
          total: 99.99,
        },
        {
          productId: '5',
          productName: 'Wireless Mouse',
          productImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
          quantity: 2,
          price: 39.99,
          total: 79.98,
        },
      ],
      subtotal: 179.97,
      shipping: 9.99,
      tax: 15.30,
      total: 205.26,
      shippingAddress: {
        id: '1',
        type: 'shipping',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (555) 123-4567',
      } as Address,
      billingAddress: {
        id: '2',
        type: 'billing',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '456 Oak Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'United States',
        phone: '+1 (555) 987-6543',
      } as Address,
      trackingNumber: 'TRK123456789',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '2024-02-20T14:15:00Z',
      status: 'shipped',
      items: [
        {
          productId: '2',
          productName: 'Smart Watch',
          productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          quantity: 1,
          price: 199.99,
          total: 199.99,
        },
      ],
      subtotal: 199.99,
      shipping: 0,
      tax: 17.00,
      total: 216.99,
      shippingAddress: {
        id: '1',
        type: 'shipping',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (555) 123-4567',
      } as Address,
      billingAddress: {
        id: '2',
        type: 'billing',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '456 Oak Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'United States',
        phone: '+1 (555) 987-6543',
      } as Address,
      trackingNumber: 'TRK987654321',
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      date: '2024-03-10T09:45:00Z',
      status: 'processing',
      items: [
        {
          productId: '4',
          productName: 'Mechanical Keyboard',
          productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
          quantity: 1,
          price: 129.99,
          total: 129.99,
        },
        {
          productId: '6',
          productName: 'USB-C Hub',
          productImage: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
          quantity: 1,
          price: 59.99,
          total: 59.99,
        },
      ],
      subtotal: 189.98,
      shipping: 9.99,
      tax: 16.15,
      total: 216.12,
      shippingAddress: {
        id: '1',
        type: 'shipping',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (555) 123-4567',
      } as Address,
      billingAddress: {
        id: '2',
        type: 'billing',
        isDefault: true,
        fullName: 'John Doe',
        addressLine1: '456 Oak Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'United States',
        phone: '+1 (555) 987-6543',
      } as Address,
    },
  ];
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      fetchOrders: async () => {
        set({ isLoading: true });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Load mock orders
          const mockOrders = generateMockOrders();

          set({
            orders: mockOrders,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>) => {
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          orderNumber: `ORD-${new Date().getFullYear()}-${String(get().orders.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },

      getOrderById: (id: string) => {
        const state = get();
        return state.orders.find((order) => order.id === id);
      },

      cancelOrder: (id: string) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status: 'cancelled' as const } : order
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);