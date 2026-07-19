// src/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginRequest, RegisterRequest } from '../api/auth';
import { useUserStore } from '../stores/useUserStore';
import { toast } from '../stores/useToastStore';
import { showErrorToast } from '../utils/error-handler';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store token
      localStorage.setItem('token', data.token);

      // Update user store
      setUser(data.user);

      // Show success message
      toast.success(`Welcome back, ${data.user.firstName}!`);

      // Navigate to profile or intended destination
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      showErrorToast(error);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Store token
      localStorage.setItem('token', data.token);

      // Update user store
      setUser(data.user);

      // Show success message
      toast.success(`Welcome, ${data.user.firstName}! Your account has been created.`);

      // Navigate to profile
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      showErrorToast(error);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: clearUserState } = useUserStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear user state
      clearUserState();

      // Clear all queries
      queryClient.clear();

      // Show success message
      toast.info('You have been logged out successfully.');

      // Navigate to home
      navigate('/');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear state even if API call fails
      clearUserState();
      queryClient.clear();
      toast.warning('Logged out (with errors)');
      navigate('/');
    },
  });
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated;
};

// Hook to get current user
export const useCurrentUser = () => {
  const { user } = useUserStore();
  return user;
};