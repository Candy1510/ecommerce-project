// src/setupTests.ts
import '@testing-library/jest-dom'; // Remove /vitest from import
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import { expect } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  toBeInTheDocument: require('@testing-library/jest-dom/matchers').toBeInTheDocument,
  // Add other matchers if needed
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());