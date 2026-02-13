import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    shopName: '',
    contactInfo: '',
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
        // 注册
        const response = await authAPI.register(formData);
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

          {!isLogin && (
            <>
              <div className="form-group">
                <label>店铺名称</label>
                <input
                  type="text"
                  name="shopName"
                  className="input"
                  value={formData.shopName}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label>联系方式（可选）</label>
                <input
                  type="text"
                  name="contactInfo"
                  className="input"
                  value={formData.contactInfo}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

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
                shopName: '',
                contactInfo: '',
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
