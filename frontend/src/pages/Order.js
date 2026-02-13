import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { menuAPI, orderAPI } from '../services/api';
import './Order.css';

const Order = () => {
  const navigate = useNavigate();
  const { cartItems, merchantId, getTotalPrice, clearCart } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('获取菜品失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
      return;
    }
    fetchMenuItems();
  }, [cartItems.length, navigate, fetchMenuItems]);

  const getCartItemDetails = () => {
    return cartItems.map((cartItem) => {
      const menuItem = menuItems.find((item) => item._id === cartItem.menuItemId);
      return {
        ...cartItem,
        menuItem,
      };
    }).filter((item) => item.menuItem);
  };

  const cartDetails = getCartItemDetails();
  const totalPrice = getTotalPrice(menuItems);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
      alert('请填写姓名和电话');
      return;
    }

    try {
      setSubmitting(true);
      await orderAPI.create({
        items: cartItems,
        merchantId,
        customerInfo,
      });
      
      alert('订单提交成功！');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('提交订单失败:', error);
      alert('提交订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="order">
      <header className="order-header">
        <h1>确认订单</h1>
      </header>

      <div className="order-content">
        <div className="order-items">
          <h2>订单详情</h2>
          {cartDetails.map((item) => (
            <div key={item.menuItemId} className="order-item">
              <div className="order-item-info">
                <span className="item-name">{item.menuItem.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">
                ¥{(item.menuItem.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="order-total">
            <span>合计：</span>
            <span className="total-price">¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <form className="customer-form" onSubmit={handleSubmit}>
          <h2>收货信息</h2>
          <div className="form-group">
            <label>姓名 *</label>
            <input
              type="text"
              className="input"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>电话 *</label>
            <input
              type="tel"
              className="input"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>地址</label>
            <input
              type="text"
              className="input"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>备注</label>
            <textarea
              className="input"
              rows="3"
              value={customerInfo.note}
              onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
              placeholder="如有特殊要求，请在此说明"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={submitting}
          >
            {submitting ? '提交中...' : '提交订单'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Order;
