// src/__tests__/pages/Checkout.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Checkout from '../../pages/Checkout';
import { useCartStore } from '../../stores/useCartStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useUserStore } from '../../stores/useUserStore';
import { Address, Product } from '../../types';

const renderCheckout = () =>
  render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );

const mockProduct: Product = {
  id: '1',
  name: 'Wireless Headphones',
  price: 50,
  image: 'https://example.com/img.jpg',
};

const mockAddress: Address = {
  id: 'addr-1',
  type: 'shipping',
  isDefault: true,
  fullName: 'Jane Doe',
  addressLine1: '123 Main St',
  city: 'Oklahoma City',
  state: 'OK',
  zipCode: '73102',
  country: 'United States',
  phone: '+1 (555) 000-0000',
};

describe('Checkout', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    useOrderStore.setState({ orders: [] });
    useUserStore.setState({ addresses: [] });
  });

  it('shows empty state when cart is empty', () => {
    renderCheckout();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('renders order summary with subtotal, shipping, and tax', () => {
    useCartStore.setState({ items: [{ ...mockProduct, quantity: 1 }] });
    useUserStore.setState({ addresses: [mockAddress] });
    renderCheckout();

    // Subtotal $50, shipping $9.99 (under free threshold), tax 8.5% = $4.25
    // $50.00 appears as both the line-item total and the subtotal
    expect(screen.getAllByText('$50.00')).toHaveLength(2);
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$4.25')).toBeInTheDocument();
    expect(screen.getByText('$64.24')).toBeInTheDocument();
  });

  it('gives free shipping over the threshold', () => {
    useCartStore.setState({ items: [{ ...mockProduct, quantity: 3 }] });
    useUserStore.setState({ addresses: [mockAddress] });
    renderCheckout();

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('disables Place Order until an address is available', () => {
    useCartStore.setState({ items: [{ ...mockProduct, quantity: 1 }] });
    renderCheckout();

    expect(
      screen.getByRole('button', { name: /place order/i })
    ).toBeDisabled();
  });

  it('places an order, clears the cart, and shows confirmation', () => {
    useCartStore.setState({ items: [{ ...mockProduct, quantity: 2 }] });
    useUserStore.setState({ addresses: [mockAddress] });
    renderCheckout();

    fireEvent.click(screen.getByRole('button', { name: /place order/i }));

    // Order created
    const orders = useOrderStore.getState().orders;
    expect(orders).toHaveLength(1);
    expect(orders[0].items[0].productName).toBe('Wireless Headphones');
    expect(orders[0].total).toBeCloseTo(108.5, 2); // 100 + 0 shipping + 8.50 tax
    expect(orders[0].shippingAddress.id).toBe(mockAddress.id);

    // Cart cleared
    expect(useCartStore.getState().items).toHaveLength(0);

    // Confirmation screen with the order number
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();
    expect(screen.getByText(orders[0].orderNumber)).toBeInTheDocument();
  });
});
