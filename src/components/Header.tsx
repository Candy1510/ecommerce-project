// src/components/Header.tsx
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';

const Header = () => {
  const totalItems = useCartStore((state) => state.totalItems());
  const { isAuthenticated, user } = useUserStore();

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo Link */}
        <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition-colors">
          E-Commerce App
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link
            to="/products"
            className="hover:text-gray-200 transition-colors"
          >
            Products
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="relative hover:text-gray-200 transition-colors"
          >
            Cart {totalItems > 0 && `(${totalItems})`}
          </Link>

          {/* Conditional Auth Links */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="hover:text-gray-200 transition-colors flex items-center gap-2"
            >
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              )}
              Profile
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="hover:text-gray-200 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-primary px-4 py-1 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;