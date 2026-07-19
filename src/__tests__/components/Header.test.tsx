// src/__tests__/components/Header.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../components/Header";
import { useCartStore } from "../../stores/useCartStore";
import { useUserStore } from "../../stores/useUserStore";
import { Product, User } from "../../types";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  price: 10,
  image: "https://example.com/img.jpg",
};

const mockUser: User = {
  id: "1",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  avatar: "https://example.com/avatar.jpg",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("Header", () => {
  beforeEach(() => {
    // Reset store state between tests
    useCartStore.setState({ items: [] });
    useUserStore.setState({ user: null, isAuthenticated: false });
  });

  it("renders logo and primary navigation links", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: /e-commerce app/i }),
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /products/i })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: /cart/i })).toHaveAttribute(
      "href",
      "/cart",
    );
  });

  it("shows Login and Sign Up when logged out", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /profile/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Profile link with avatar when authenticated", () => {
    useUserStore.setState({ user: mockUser, isAuthenticated: true });
    renderHeader();

    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByAltText("Profile")).toHaveAttribute(
      "src",
      mockUser.avatar,
    );
    expect(
      screen.queryByRole("link", { name: /login/i }),
    ).not.toBeInTheDocument();
  });

  it("hides cart count when the cart is empty", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: /cart/i })).toHaveTextContent(
      /^Cart$/,
    );
  });

  it("shows total item count in cart link", () => {
    useCartStore.setState({
      items: [
        { ...mockProduct, quantity: 2 },
        { ...mockProduct, id: "2", quantity: 1 },
      ],
    });
    renderHeader();

    expect(screen.getByRole("link", { name: /cart/i })).toHaveTextContent(
      "Cart (3)",
    );
  });
});
