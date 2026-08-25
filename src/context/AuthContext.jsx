import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('shoply_auth');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.token && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error('Failed to restore auth session', e);
      localStorage.removeItem('shoply_auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in user via DummyJSON Auth API
   */
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await loginUser({ username, password });

      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
      };

      const authToken = response.token || response.accessToken;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem(
        'shoply_auth',
        JSON.stringify({ user: userData, token: authToken })
      );

      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shoply_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
