// src/hooks/index.ts

// Auth hooks
export { useLogin, useRegister, useLogout, useIsAuthenticated, useCurrentUser } from './useAuth';

// Product hooks
export { useProducts, useProduct, useProductSearch, productKeys } from './useProducts';

// Utility hooks
export { useForm } from '../hooks/useForm';
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';