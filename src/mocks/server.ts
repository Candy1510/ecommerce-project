// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define handlers for API mocking
export const handlers = [
  // Example: Mock products API
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: '1', name: 'Product 1', price: 99.99 },
      { id: '2', name: 'Product 2', price: 149.99 },
    ]);
  }),
];

// Setup server with handlers
export const server = setupServer(...handlers);