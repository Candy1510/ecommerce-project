// src/stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address } from '../types';

interface UserStore {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // User Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;

  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string, type: 'shipping' | 'billing') => void;
  getDefaultAddress: (type: 'shipping' | 'billing') => Address | undefined;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock user data - replace with actual API call
          // In production, password would be sent to API for validation
          // For now, we accept any password for demo purposes
          console.log('Mock login with email:', email, 'password:', password ? '***' : 'none');

          const mockUser: User = {
            id: '1',
            email: email,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 (555) 123-4567',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock addresses
          const mockAddresses: Address[] = [
            {
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
            },
            {
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
            },
          ];

          set({
            user: mockUser,
            addresses: mockAddresses,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          addresses: [],
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            ...updates,
            updatedAt: new Date().toISOString(),
          } : null,
        }));
      },

      clearUser: () => {
        set({
          user: null,
          addresses: [],
          isAuthenticated: false,
        });
      },

      // Address Management
      addAddress: (address: Omit<Address, 'id'>) => {
        const newAddress: Address = {
          ...address,
          id: Date.now().toString(),
        };

        set((state) => {
          let updatedAddresses = [...state.addresses, newAddress];

          // If this is set as default, unset other defaults of the same type
          if (newAddress.isDefault) {
            updatedAddresses = updatedAddresses.map((addr) =>
              addr.type === newAddress.type && addr.id !== newAddress.id
                ? { ...addr, isDefault: false }
                : addr
            );
          }

          return { addresses: updatedAddresses };
        });
      },

      updateAddress: (id: string, updates: Partial<Address>) => {
        set((state) => {
          let updatedAddresses = state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...updates } : addr
          );

          // If setting as default, unset other defaults of the same type
          if (updates.isDefault) {
            const updatedAddress = updatedAddresses.find((a) => a.id === id);
            if (updatedAddress) {
              updatedAddresses = updatedAddresses.map((addr) =>
                addr.type === updatedAddress.type && addr.id !== id
                  ? { ...addr, isDefault: false }
                  : addr
              );
            }
          }

          return { addresses: updatedAddresses };
        });
      },

      deleteAddress: (id: string) => {
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
        }));
      },

      setDefaultAddress: (id: string, type: 'shipping' | 'billing') => {
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id && addr.type === type ? true : addr.type === type ? false : addr.isDefault,
          })),
        }));
      },

      getDefaultAddress: (type: 'shipping' | 'billing') => {
        const state = get();
        return state.addresses.find((addr) => addr.type === type && addr.isDefault);
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        addresses: state.addresses,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
