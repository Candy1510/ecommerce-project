// src/pages/Checkout.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';
import { useUserStore } from '../stores/useUserStore';
import { toast } from '../stores/useToastStore';
import AddressForm from '../components/AddressForm';
import { Address, OrderItem } from '../types';

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT_RATE = 9.99;
const TAX_RATE = 0.085;

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const addOrder = useOrderStore((state) => state.addOrder);
  const { addresses, getDefaultAddress } = useUserStore();

  const shippingAddresses = addresses.filter((a) => a.type === 'shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    getDefaultAddress('shipping')?.id ?? shippingAddresses[0]?.id ?? null
  );
  const [showAddressForm, setShowAddressForm] = useState(
    shippingAddresses.length === 0
  );
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(
    null
  );

  // Order confirmation screen (shown after the cart has been cleared)
  if (placedOrderNumber) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Placed!
        </h1>
        <p className="text-gray-600 mb-6">
          Your order <span className="font-semibold">{placedOrderNumber}</span>{' '}
          has been received and is now processing.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/profile')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            View Order History
          </button>
          <Link
            to="/products"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-6">
          Add some products before checking out.
        </p>
        <Link
          to="/products"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const selectedAddress: Address | undefined = shippingAddresses.find(
    (a) => a.id === selectedAddressId
  );

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.id,
      productName: item.name,
      productImage: item.image,
      quantity: item.quantity,
      price: item.price,
      total: Math.round(item.price * item.quantity * 100) / 100,
    }));

    addOrder({
      status: 'processing',
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: selectedAddress,
      billingAddress: selectedAddress,
    });

    // Clear the cart silently (skip the "Cart cleared" toast)
    useCartStore.setState({ items: [] });

    const newOrder = useOrderStore.getState().orders[0];
    setPlacedOrderNumber(newOrder?.orderNumber ?? null);
    toast.success('Order placed successfully!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Shipping Address
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-primary hover:text-secondary font-medium"
                >
                  + Add New Address
                </button>
              )}
            </div>

            {shippingAddresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {shippingAddresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {address.fullName}
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm && (
              <AddressForm
                onCancel={() => setShowAddressForm(false)}
                onSave={() => {
                  setShowAddressForm(false);
                  // Select the most recently added shipping address
                  const updated = useUserStore
                    .getState()
                    .addresses.filter((a) => a.type === 'shipping');
                  const newest = updated[updated.length - 1];
                  if (newest) setSelectedAddressId(newest.id);
                }}
              />
            )}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress}
              className="w-full mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>

            {!selectedAddress && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Add a shipping address to place your order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
