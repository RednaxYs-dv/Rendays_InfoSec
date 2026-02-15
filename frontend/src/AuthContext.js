import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    try {
      const token    = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Login failed');

    const userData = {
      id:       data.id,
      username: data.username,
      email:    data.email,
      role:     data.role,
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const register = async (formData) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
