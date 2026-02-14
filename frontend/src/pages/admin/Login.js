import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

// 注册仅需用户名与密码，店铺名称/联系方式已移除
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // 登录
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password,
        });
        login(response.data.token, response.data.merchant);
        navigate('/admin/dashboard');
      } else {
        // 注册（后端需要 shopName，用用户名代替）
        const response = await authAPI.register({
          ...formData,
          shopName: formData.username,
          contactInfo: '',
        });
        login(response.data.token, response.data.merchant);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>商家后台管理系统</h1>
          <p>{isLogin ? '登录您的账户' : '注册新账户'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              name="username"
              className="input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                username: '',
                password: '',
              });
            }}
          >
            {isLogin ? '还没有账户？点击注册' : '已有账户？点击登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
