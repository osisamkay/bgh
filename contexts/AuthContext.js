import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from './NotificationContext';

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotification();

  useEffect(() => {
    setMounted(true);
    // Check for stored auth token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user data
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
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
      } else {
        // Invalid token, clear storage
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          termsAccepted: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.details || data.error || 'Signup failed', 'error');
        return {
          success: false,
          message: data.details || data.error || 'Signup failed'
        };
      }

      addNotification(data.details || 'Registration successful! Please check your email to verify your account.', 'success');
      return {
        success: true,
        message: data.message,
        details: data.details,
        emailDetails: data.emailDetails || null
      };
    } catch (error) {
      console.error('Signup error:', error);
      addNotification(error.message || 'An error occurred during signup', 'error');
      return {
        success: false,
        message: error.message,
        details: error.message
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        addNotification(data.message || 'Login failed', 'error');
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      // Check if email is verified
      if (!data.user.emailVerified) {
        addNotification('Please verify your email to continue', 'warning');
        router.push('/verify-email');
        return {
          success: true,
          requiresVerification: true,
          message: 'Login successful but email verification required'
        };
      }

      // Email is verified
      addNotification('Login successful', 'success');
      router.push('/');
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

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    addNotification('Logged out successfully', 'info');
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
        throw new Error(data.message || 'Email verification failed');
      }

      // After successful verification, set the user and token
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    verifyEmail,
    resetPassword,
    updateUser
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 