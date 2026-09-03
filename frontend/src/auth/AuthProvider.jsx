import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    api.setToken(token);
    if (token) {
      setLoading(true);
      api.get('/api/auth/me').then(res => {
        setUser(res.data);
      }).catch(() => {
        setToken(null);
        localStorage.removeItem('token');
      }).finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const t = res.data.token;
    localStorage.setItem('token', t);
    setToken(t);
    api.setToken(t);
    const me = await api.get('/api/auth/me');
    setUser(me.data);
    return me.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
