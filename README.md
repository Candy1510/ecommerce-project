# E-Commerce App

A React + TypeScript e-commerce frontend with product browsing, cart, checkout, authentication, and order history. Currently runs entirely on mock data, so it works out of the box with no backend.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Zustand** for state management (cart, orders, user, toasts) with localStorage persistence
- **React Router v6** for routing
- **TanStack Query** for data fetching
- **Vitest** + Testing Library + MSW for testing

## Getting Started

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build          # type-check and build for production
npm run preview        # preview the production build locally
npm test               # run the test suite
npm run test:coverage  # run tests with coverage report
npm run lint           # run ESLint
```

## Features

- **Products**  browse the catalog with search and product cards
- **Cart**  add/remove items, adjust quantities, running totals
- **Checkout**  select or add a shipping address, order summary with
  shipping (free over $100) and tax, order confirmation
- **Auth**  mock login/registration (any credentials work in demo mode)
- **Profile**  edit profile, manage addresses, view and cancel orders
- Error boundary, toast notifications, protected routes, debounced search

## Project Structure

```
src/
├── api/          # API modules (currently mock data)
├── components/   # Reusable UI components
├── hooks/        # Custom hooks (useForm, useDebounce, useAuth, ...)
├── lib/          # API client
├── mocks/        # MSW server for tests
├── pages/        # Route pages (Home, Products, Cart, Checkout, ...)
├── stores/       # Zustand stores
├── types/        # Shared TypeScript types
├── utils/        # Error handling utilities
└── __tests__/    # Test suite
```

## Connecting a Real Backend

The app ships with mock data. To connect a real API:

1. Copy `.env.example` to `.env` and set `VITE_API_URL`
2. Replace the mock implementations in `src/api/` with calls through
   `src/lib/api-client.ts` (auth token handling and error parsing are
   already built in)

## Deployment

The repo includes SPA rewrite configs so client-side routes work on direct navigation:

**Vercel**  import the repo at vercel.com/new; `vercel.json` is picked up automatically.

**Netlify**  import the repo at app.netlify.com; `netlify.toml` sets the build command, publish directory, and redirects.

**Anywhere else**  serve the `dist/` folder as static files and rewrite all paths to `/index.html`.
