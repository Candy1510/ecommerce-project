// src/pages/Products.tsx
import { useState } from 'react';
import ProductList from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, error } = useProducts({
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });
  const queryError = error as Error | null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Products</h1>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'name')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              title="Toggle sort order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        {data && (
          <p className="text-gray-600 text-sm mb-4">
            Showing {data.products.length} of {data.total} products
          </p>
        )}
      </div>

      {/* Error State */}
      {queryError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          Error loading products. Please try again later.
        </div>
      )}

      {/* Product List */}
      <ProductList
        products={data?.products || []}
        loading={isLoading}
        emptyMessage={
          searchTerm
            ? `No products found for "${searchTerm}"`
            : "No products available at the moment"
        }
      />
    </div>
  );
};

export default Products;