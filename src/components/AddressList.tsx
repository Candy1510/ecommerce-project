// src/components/AddressList.tsx
import { useState } from 'react';
import { Address } from '../types';
import { useUserStore } from '../stores/useUserStore';
import AddressForm from './AddressForm';

const AddressList = () => {
  const { addresses, deleteAddress, setDefaultAddress } = useUserStore();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
    }
  };

  const handleSetDefault = (id: string, type: 'shipping' | 'billing') => {
    setDefaultAddress(id, type);
  };

  const handleCancelForm = () => {
    setEditingAddress(null);
    setIsAddingNew(false);
  };

  const handleSaveForm = () => {
    setEditingAddress(null);
    setIsAddingNew(false);
  };

  if (isAddingNew || editingAddress) {
    return (
      <AddressForm
        address={editingAddress || undefined}
        onCancel={handleCancelForm}
        onSave={handleSaveForm}
      />
    );
  }

  const shippingAddresses = addresses.filter((addr) => addr.type === 'shipping');
  const billingAddresses = addresses.filter((addr) => addr.type === 'billing');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
        >
          + Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No addresses saved yet</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <>
          {/* Shipping Addresses */}
          {shippingAddresses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Shipping Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Billing Addresses */}
          {billingAddresses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Billing Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {billingAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, type: 'shipping' | 'billing') => void;
}

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-transparent hover:border-primary transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{address.fullName}</h4>
          {address.isDefault && (
            <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded mt-1">
              Default
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="text-gray-600 text-sm space-y-1">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p>{address.country}</p>
        <p>{address.phone}</p>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address.id, address.type)}
          className="mt-3 text-primary hover:text-secondary text-sm font-medium"
        >
          Set as Default
        </button>
      )}
    </div>
  );
};

export default AddressList;