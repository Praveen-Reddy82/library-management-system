import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check for existing token and restore user session
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          console.log('AuthContext: Found stored token, fetching user profile');
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          // Fetch user profile to restore session
          const response = await axios.get(API_ENDPOINTS.AUTH.PROFILE);
          const cleanUser = {
            _id: response.data._id,
            name: response.data.name,
            phone: response.data.phone,
            membershipType: response.data.membershipType,
            membershipId: response.data.membershipId,
            address: response.data.address,
            role: response.data.role,
            joinDate: response.data.joinDate,
            isActive: response.data.isActive,
            borrowedBooks: response.data.borrowedBooks,
            membershipInfo: response.data.membershipInfo,
          };
          setUser(cleanUser);
          setToken(storedToken);
          console.log('AuthContext: User session restored:', cleanUser);
        } catch (error) {
          console.error('AuthContext: Failed to restore session:', error);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (userId, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        userId,
        password,
      });

      const { user, token } = response.data;
      // Clean up the user object to remove Mongoose internal properties
      const cleanUser = {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        membershipType: user.membershipType,
        membershipId: user.membershipId,
        address: user.address,
        role: user.role,
        joinDate: user.joinDate,
        isActive: user.isActive,
        borrowedBooks: user.borrowedBooks,
        membershipInfo: user.membershipInfo,
      };
      setUser(cleanUser);
      setToken(token);
      localStorage.setItem('token', token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(API_ENDPOINTS.AUTH.PROFILE, userData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};