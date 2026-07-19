// src/__tests__/stores/useCartStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../stores/useCartStore';
import { Product } from '../../types';

// Mock toast
vi.mock('../../stores/useToastStore', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  image: 'https://example.com/image.jpg',
  description: 'Test description',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Another Product',
  price: 49.99,
  image: 'https://example.com/image2.jpg',
  description: 'Another description',
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems()).toBe(0);
    expect(result.current.totalPrice()).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      ...mockProduct,
      quantity: 1,
    });
  });

  it('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('adds multiple different items', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe('1');
    expect(result.current.items[1].id).toBe('2');
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.updateQuantity('1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
  });

  it('calculates total items correctly', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct); // quantity: 1
      result.current.addItem(mockProduct); // quantity: 2
      result.current.addItem(mockProduct2); // quantity: 1
    });

    expect(result.current.totalItems()).toBe(3);
  });

  it('calculates total price correctly', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct); // $99.99 x 1
      result.current.addItem(mockProduct2); // $49.99 x 1
    });

    const expectedTotal = 99.99 + 49.99;
    expect(result.current.totalPrice()).toBeCloseTo(expectedTotal, 2);
  });

  it('calculates total price with multiple quantities', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
      result.current.updateQuantity('1', 3);
    });

    const expectedTotal = 99.99 * 3;
    expect(result.current.totalPrice()).toBeCloseTo(expectedTotal, 2);
  });

  it('handles removing non-existent item gracefully', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct);
    });

    expect(() => {
      act(() => {
        result.current.removeItem('non-existent-id');
      });
    }).not.toThrow();

    expect(result.current.items).toHaveLength(1);
  });
});