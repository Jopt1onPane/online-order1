import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Order from './pages/Order';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenuManage from './pages/admin/MenuManage';
import AdminOrders from './pages/admin/Orders';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* 用户端路由 */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            
            {/* 商家端路由 */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/menu" 
              element={
                <ProtectedRoute>
                  <AdminMenuManage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              } 
            />
            
            {/* 默认重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
