import React, { useState, useEffect, useCallback } from 'react';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import CartButton from '../components/CartButton';
import './Home.css';

const categories = ['全部', '主菜', '汤', '小吃', '饮料'];

const Home = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const { addToCart } = useCart();

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const category = selectedCategory === '全部' ? '' : selectedCategory;
      const response = await menuAPI.getAll(category);
      setMenuItems(response.data);
    } catch (error) {
      console.error('获取菜品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      merchantId: item.merchantId._id || item.merchantId,
    });
  };

  return (
    <div className="home">
      <header className="home-header">
        <h1>🍽️ 美味餐厅</h1>
        <p>欢迎光临，尽情挑选您喜爱的美食</p>
      </header>

      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : menuItems.length === 0 ? (
        <div className="empty-state">
          <p>暂无菜品</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item._id} className="menu-item-card">
              <div className="menu-item-image">
                {item.imageUrl ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${item.imageUrl}`} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">暂无图片</div>
                )}
              </div>
              <div className="menu-item-info">
                <h3>{item.name}</h3>
                {item.description && <p className="description">{item.description}</p>}
                <div className="menu-item-footer">
                  <span className="price">¥{item.price.toFixed(2)}</span>
                  <button
                    className="btn btn-primary add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CartButton />
    </div>
  );
};

export default Home;
