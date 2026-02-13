import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import './MenuManage.css';

const categories = ['主菜', '汤', '小吃', '饮料'];

const MenuManage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '主菜',
    image: null,
    isAvailable: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getMyItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('获取菜品失败:', error);
      setError('获取菜品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingItem) {
        // 更新
        await menuAPI.update(editingItem._id, formData);
      } else {
        // 创建
        await menuAPI.create(formData);
      }
      resetForm();
      fetchMenuItems();
    } catch (error) {
      setError(error.response?.data?.error || '操作失败，请重试');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: null,
      isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个菜品吗？')) return;

    try {
      await menuAPI.delete(id);
      fetchMenuItems();
    } catch (error) {
      setError(error.response?.data?.error || '删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '主菜',
      image: null,
      isAvailable: true,
    });
    setEditingItem(null);
    setShowForm(false);
    setError('');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="menu-manage">
      <header className="manage-header">
        <div className="header-content">
          <h1>菜品管理</h1>
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn btn-secondary">
              返回
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + 添加菜品
            </button>
          </div>
        </div>
      </header>

      <div className="manage-content">
        {showForm && (
          <div className="form-modal">
            <div className="form-container">
              <h2>{editingItem ? '编辑菜品' : '添加菜品'}</h2>
              {error && <div className="error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>菜品名称 *</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    name="description"
                    className="input"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>价格 *</label>
                    <input
                      type="number"
                      name="price"
                      className="input"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>分类 *</label>
                    <select
                      name="category"
                      className="input"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>菜品图片</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="input"
                  />
                  {editingItem?.imageUrl && !formData.image && (
                    <div className="current-image">
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${editingItem.imageUrl}`}
                        alt="当前图片"
                      />
                      <span>当前图片</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                    />
                    上架
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    取消
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && !showForm && <div className="error">{error}</div>}

        {menuItems.length === 0 ? (
          <div className="empty-state">
            <p>还没有菜品，点击"添加菜品"开始吧！</p>
          </div>
        ) : (
          <div className="menu-items-grid">
            {menuItems.map((item) => (
              <div key={item._id} className="menu-item-card">
                <div className="menu-item-image">
                  {item.imageUrl ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${item.imageUrl}`}
                      alt={item.name}
                    />
                  ) : (
                    <div className="placeholder-image">暂无图片</div>
                  )}
                  {!item.isAvailable && (
                    <div className="unavailable-badge">已下架</div>
                  )}
                </div>
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  {item.description && <p className="description">{item.description}</p>}
                  <div className="menu-item-meta">
                    <span className="category">{item.category}</span>
                    <span className="price">¥{item.price.toFixed(2)}</span>
                  </div>
                  <div className="menu-item-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManage;
