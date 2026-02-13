import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [merchantId, setMerchantId] = useState(null);

  // 从本地存储加载购物车
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    const savedMerchantId = localStorage.getItem('cartMerchantId');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedMerchantId) {
      setMerchantId(savedMerchantId);
    }
  }, []);

  // 保存购物车到本地存储
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    if (merchantId) {
      localStorage.setItem('cartMerchantId', merchantId);
    } else {
      localStorage.removeItem('cartMerchantId');
    }
  }, [cartItems, merchantId]);

  const addToCart = (item) => {
    const merchant = item.merchantId?._id || item.merchantId;
    // 如果购物车为空或属于不同商家，清空购物车
    if (merchantId && merchantId !== merchant) {
      setCartItems([]);
      setMerchantId(merchant);
    } else if (!merchantId) {
      setMerchantId(merchant);
    }

    const snapshot = {
      menuItemId: item._id,
      quantity: 1,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || '',
    };
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.menuItemId === item._id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.menuItemId === item._id
            ? { ...i, quantity: i.quantity + 1, name: i.name || item.name, price: i.price != null ? i.price : item.price, imageUrl: i.imageUrl != null ? i.imageUrl : (item.imageUrl || '') }
            : i
        );
      }
      return [...prevItems, snapshot];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
    if (cartItems.length === 1) {
      setMerchantId(null);
    }
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setMerchantId(null);
  };

  const getTotalPrice = (menuItemsOrCartItems) => {
    if (Array.isArray(menuItemsOrCartItems) && menuItemsOrCartItems.length > 0 && menuItemsOrCartItems[0]._id != null) {
      return cartItems.reduce((total, cartItem) => {
        const menuItem = menuItemsOrCartItems.find((item) => item._id === cartItem.menuItemId);
        return total + (menuItem ? menuItem.price * cartItem.quantity : 0);
      }, 0);
    }
    return cartItems.reduce((total, cartItem) => {
      const price = cartItem.price != null ? Number(cartItem.price) : 0;
      return total + price * (cartItem.quantity || 0);
    }, 0);
  };

  const getTotalCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    merchantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
