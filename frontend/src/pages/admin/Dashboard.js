import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { merchant, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>商家后台</h1>
          <div className="header-actions">
            <span className="merchant-name">欢迎，{merchant?.username || '商家'}</span>
            <button onClick={logout} className="btn btn-secondary">
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <Link to="/admin/menu" className="dashboard-card">
            <div className="card-icon">🍽️</div>
            <h2>菜品管理</h2>
            <p>添加、编辑和删除菜品</p>
          </Link>

          <Link to="/admin/orders" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h2>订单管理</h2>
            <p>查看和处理订单</p>
          </Link>

          <Link to="/" className="dashboard-card">
            <div className="card-icon">👁️</div>
            <h2>查看用户端</h2>
            <p>预览用户看到的页面</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
