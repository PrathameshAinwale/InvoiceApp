import { createContext, useContext, useState } from "react";
import API from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);   // ← accepts user object { id, name, email }
    try { localStorage.setItem('user', JSON.stringify(userData)); } catch (e) {}
  };

  const signup = (email, password, name) => {
    const obj = { email, name };
    setUser(obj);
    try { localStorage.setItem('user', JSON.stringify(obj)); } catch (e) {}
  };

  const logout = async () => {
    try {
      await API.post('/users/logout');
    } catch (e) {
      // ignore errors — still clear local state
    }
    setUser(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
