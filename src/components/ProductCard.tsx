// src/components/ProductCard.tsx
import { Product } from "../types";
import { useCartStore } from "../stores/useCartStore";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative overflow-hidden group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {product.description && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h2>

        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={() => addItem(product)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
