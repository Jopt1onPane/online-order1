import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import './CartButton.css';

const CartButton = () => {
  const { getTotalCount } = useCart();
  const count = getTotalCount();

  if (count === 0) return null;

  return (
    <Link to="/cart" className="cart-button">
      <FaShoppingCart />
      <span className="cart-count">{count}</span>
    </Link>
  );
};

export default CartButton;
