import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { menuAPI, orderAPI } from '../services/api';
import './Order.css';

const Order = () => {
  const navigate = useNavigate();
  const { cartItems, merchantId, getTotalPrice, clearCart } = useCart();
  const [extraItemData, setExtraItemData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const needFetch = cartItems.length > 0 && cartItems.some((i) => !i.name);
  const fetchIds = useMemo(() => (needFetch ? cartItems.map((i) => i.menuItemId) : []), [needFetch, cartItems]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
      return;
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (fetchIds.length === 0) return;
    let cancelled = false;
    setLoading(true);
    menuAPI.getByIds(fetchIds)
      .then((res) => {
        if (cancelled) return;
        const map = {};
        (res.data || []).forEach((m) => {
          map[m._id] = { name: m.name, price: m.price };
        });
        setExtraItemData(map);
      })
      .catch(() => { if (!cancelled) setExtraItemData({}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchIds.join(',')]);

  const cartDetails = useMemo(() => {
    return cartItems.map((cartItem) => ({
      ...cartItem,
      name: cartItem.name ?? extraItemData[cartItem.menuItemId]?.name,
      price: cartItem.price ?? extraItemData[cartItem.menuItemId]?.price,
    })).filter((item) => item.name != null);
  }, [cartItems, extraItemData]);

  const totalPrice = cartDetails.length
    ? cartDetails.reduce((t, i) => t + Number(i.price || 0) * (i.quantity || 0), 0)
    : getTotalPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await orderAPI.create({
        items: cartItems.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
        merchantId,
        customerInfo: {},
      });
      alert('订单提交成功！');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('提交订单失败:', error);
      alert(error.response?.data?.error || '提交订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) return null;
  if (needFetch && loading) return <div className="loading">加载中...</div>;

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
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
              <span className="item-price">
                ¥{(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="order-total">
            <span>合计：</span>
            <span className="total-price">¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="order-submit-card">
          <p className="order-submit-hint">确认订单内容无误后点击提交</p>
          <button
            type="button"
            className="btn btn-primary submit-btn"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? '提交中...' : '提交订单'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
