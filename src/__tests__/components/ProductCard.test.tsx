// src/__tests__/components/ProductCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../types";

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  price: 99.99,
  image: "https://example.com/image.jpg",
  description: "Test description",
};

describe("ProductCard", () => {
  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders product image with correct alt text", () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText("Test Product");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", mockProduct.image);
  });

  it("calls onAddToCart when Add to Cart button is clicked", () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    const addButton = screen.getByRole("button", {
      name: `Add ${mockProduct.name} to cart`,
    });
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("applies hover styles on mouse enter", () => {
    render(<ProductCard product={mockProduct} />);

    const card = document.querySelector(".shadow-md");
    expect(card).toHaveClass("hover:shadow-lg");
  });

  it("formats price with two decimal places", () => {
    const productWithPrice = { ...mockProduct, price: 100 };
    render(<ProductCard product={productWithPrice} />);

    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("renders without onAddToCart callback", () => {
    expect(() => {
      render(<ProductCard product={mockProduct} />);
    }).not.toThrow();
  });
});
