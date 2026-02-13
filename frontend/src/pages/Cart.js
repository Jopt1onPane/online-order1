import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { menuAPI } from '../services/api';
import './Cart.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const [extraItemData, setExtraItemData] = useState({});
  const [loading, setLoading] = useState(false);

  const needFetch = cartItems.length > 0 && cartItems.some((i) => !i.name);
  const fetchIds = useMemo(() => needFetch ? cartItems.map((i) => i.menuItemId) : [], [needFetch, cartItems]);

  useEffect(() => {
    if (fetchIds.length === 0) return;
    let cancelled = false;
    setLoading(true);
    menuAPI.getByIds(fetchIds)
      .then((res) => {
        if (cancelled) return;
        const map = {};
        (res.data || []).forEach((m) => {
          map[m._id] = { name: m.name, price: m.price, imageUrl: m.imageUrl || '' };
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
      imageUrl: cartItem.imageUrl ?? extraItemData[cartItem.menuItemId]?.imageUrl ?? '',
    })).filter((item) => item.name != null);
  }, [cartItems, extraItemData]);

  const totalPrice = cartDetails.length
    ? cartDetails.reduce((t, i) => t + Number(i.price || 0) * (i.quantity || 0), 0)
    : getTotalPrice();

  if (needFetch && loading) {
    return <div className="loading">加载中...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-content">
          <h2>购物车是空的</h2>
          <p>快去挑选您喜爱的美食吧！</p>
          <Link to="/" className="btn btn-primary">
            去选购
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <header className="cart-header">
        <h1>购物车</h1>
      </header>

      <div className="cart-items">
        {cartDetails.map((item) => (
          <div key={item.menuItemId} className="cart-item">
            <div className="cart-item-image">
              {item.imageUrl ? (
                <img src={`${API_BASE}${item.imageUrl}`} alt={item.name} />
              ) : (
                <div className="placeholder-image">暂无图片</div>
              )}
            </div>
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p className="price">¥{Number(item.price).toFixed(2)}</p>
            </div>
            <div className="cart-item-controls">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="cart-item-total">
              <span>¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
            <button
              className="remove-btn"
              onClick={() => removeFromCart(item.menuItemId)}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-summary">
          <div className="summary-row">
            <span>合计：</span>
            <span className="total-price">¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="cart-actions">
          <Link to="/" className="btn btn-secondary">
            继续购物
          </Link>
          <Link to="/order" className="btn btn-primary">
            去结算
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
