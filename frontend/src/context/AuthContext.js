import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的token
    const token = localStorage.getItem('merchantToken');
    const merchantInfo = localStorage.getItem('merchantInfo');
    
    if (token && merchantInfo) {
      setMerchant(JSON.parse(merchantInfo));
    }
    setLoading(false);
  }, []);

  const login = (token, merchantInfo) => {
    localStorage.setItem('merchantToken', token);
    localStorage.setItem('merchantInfo', JSON.stringify(merchantInfo));
    setMerchant(merchantInfo);
  };

  const logout = () => {
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('merchantInfo');
    setMerchant(null);
  };

  const value = {
    merchant,
    login,
    logout,
    loading,
    isAuthenticated: !!merchant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
