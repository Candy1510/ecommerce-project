// src/pages/Home.tsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to Our E-Commerce Store
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover amazing products at great prices
      </p>
      <Link
        to="/products"
        className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors"
      >
        Browse Products
      </Link>
    </div>
  );
};

export default Home;
