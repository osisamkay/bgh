import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from './NotificationContext';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  // Add new state for token refresh
  const [refreshTimer, setRefreshTimer] = useState(null);

  useEffect(() => {
    setMounted(true);

    // Check for stored auth tokens on mount
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (token) {
      // Validate token and get user data
      validateToken(token, refreshToken);
    } else {
      setLoading(false);
    }

    return () => {
      // Clean up refresh timer on unmount
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  // Helper to check if token is expired or about to expire
  const isTokenExpiring = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Check if token expires in less than 2 minutes
      return exp < (now + 2 * 60 * 1000);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume token is bad if we can't parse it
    }
  };

  // Enhanced token validation with auto-refresh
  const validateToken = async (token, refreshToken) => {
    try {
      if (isTokenExpiring(token) && refreshToken) {
        // Token is expiring soon, try to refresh it
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          token = newToken;
        }
      }

      const response = await fetch('/api/auth/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Set up token refresh
        setupTokenRefresh(token, refreshToken);

        // Route protection for admin pages
        if (router.pathname.startsWith('/admin') && data.user.role !== 'ADMIN') {
          router.push('/');
          addNotification('Access denied: Admin privileges required', 'error');
        }
      } else {
        // Invalid token, try to refresh
        if (refreshToken) {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            // Recursively call validateToken with new token
            return validateToken(newToken, refreshToken);
          }
        }

        // If we get here, token refresh failed or wasn't attempted
        handleAuthFailure();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      handleAuthFailure();
    } finally {
      setLoading(false);
    }
  };

  // Token refresh logic in AuthContext
  const setupTokenRefresh = (token, refreshToken) => {
    if (!token || !refreshToken) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expTime - currentTime;

      // If token already expired, refresh immediately
      if (timeUntilExpiry <= 0) {
        refreshAccessToken(refreshToken);
        return;
      }

      // Refresh when 75% of token lifetime has passed
      const refreshTime = timeUntilExpiry * 0.75;

      // Clear any existing timer
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      // Set new timer
      const timerId = setTimeout(() => {
        refreshAccessToken(refreshToken);
      }, refreshTime);

      setRefreshTimer(timerId);
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  };

  // Refresh access token function
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.token);

      // Set up new refresh timer
      setupTokenRefresh(data.token, refreshToken);

      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      handleAuthFailure();
      return null;
    }
  };

  // Handle authentication failure
  const handleAuthFailure = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    // Only redirect to login if we're not already on a public page
    const publicPages = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
    const isPublicPage = publicPages.some(page => router.pathname.startsWith(page));

    if (!isPublicPage) {
      router.push('/login');
    }
  };

  // Enhanced login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Login failed', 'error');
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      // Store tokens
      localStorage.setItem('access_token', data.token);
      if (data.refreshToken) {
        // In production, refresh token is set as HTTP-only cookie
        // In development, store in localStorage
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      setUser(data.user);

      // Set up token refresh
      setupTokenRefresh(data.token, data.refreshToken);

      // Check if email verification is required
      if (data.requiresVerification) {
        addNotification('Please verify your email to continue', 'warning');
        router.push('/verify-email');
        return {
          success: true,
          requiresVerification: true,
          message: 'Login successful but email verification required'
        };
      }

      // Email is verified, route based on user role
      addNotification('Login successful', 'success');

      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

      return {
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      addNotification(error.message || 'An error occurred during login', 'error');
      return {
        success: false,
        message: error.message
      };
    }
  };

  const logout = async () => {
    try {
      // Clear refresh timer
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        setRefreshTimer(null);
      }

      // Call logout API to invalidate refresh token on server
      if (user) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
      }

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      setUser(null);
      addNotification('Logged out successfully', 'info');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      router.push('/login');
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Signup failed', 'error');
        return {
          success: false,
          message: data.message || 'Signup failed'
        };
      }

      addNotification('Signup successful! Please check your email to verify your account.', 'success');
      router.push('/verify-email');

      return {
        success: true,
        message: 'Signup successful'
      };
    } catch (error) {
      console.error('Signup error:', error);
      addNotification(error.message || 'An error occurred during signup', 'error');
      return {
        success: false,
        message: error.message
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Email verification failed', 'error');
        return {
          success: false,
          message: data.message || 'Email verification failed'
        };
      }

      addNotification('Email verified successfully!', 'success');
      router.push('/login');

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      addNotification(error.message || 'An error occurred during email verification', 'error');
      return {
        success: false,
        message: error.message
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Password reset failed', 'error');
        return {
          success: false,
          message: data.message || 'Password reset failed'
        };
      }

      addNotification('Password reset successful!', 'success');
      router.push('/login');

      return {
        success: true,
        message: 'Password reset successful'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      addNotification(error.message || 'An error occurred during password reset', 'error');
      return {
        success: false,
        message: error.message
      };
    }
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(prev => ({ ...prev, ...data.user }));
      addNotification('Profile updated successfully', 'success');

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      addNotification(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Failed to fetch profile', 'error');
        return {
          success: false,
          message: data.message || 'Failed to fetch profile'
        };
      }

      setUser(data.user);

      return {
        success: true,
        message: 'Profile fetched successfully',
        user: data.user
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      addNotification(error.message || 'An error occurred while fetching profile', 'error');
      return {
        success: false,
        message: error.message
      };
    }
  };

  const value = {
    user,
    loading,
    mounted,
    signup,
    login,
    logout,
    verifyEmail,
    resetPassword,
    updateUser,
    fetchUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}