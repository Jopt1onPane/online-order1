import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import './Orders.css';

const statusOptions = ['全部', '待处理', '已完成', '已取消'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const status = selectedStatus === '全部' ? '' : selectedStatus;
      const response = await orderAPI.getMyOrders(status);
      setOrders(response.data);
    } catch (error) {
      console.error('获取订单失败:', error);
      setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      setError(error.response?.data?.error || '更新状态失败');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="admin-orders">
      <header className="orders-header">
        <div className="header-content">
          <h1>订单管理</h1>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            返回
          </Link>
        </div>
      </header>

      <div className="orders-content">
        <div className="status-filters">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`status-filter ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>暂无订单</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>订单号：{order.orderNumber}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`order-status status-${order.status}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.customerInfo && (
                  <div className="customer-info">
                    <h4>客户信息</h4>
                    {order.customerInfo.name && <p>姓名：{order.customerInfo.name}</p>}
                    {order.customerInfo.phone && <p>电话：{order.customerInfo.phone}</p>}
                    {order.customerInfo.address && <p>地址：{order.customerInfo.address}</p>}
                    {order.customerInfo.note && <p>备注：{order.customerInfo.note}</p>}
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    <span>总计：</span>
                    <span className="total-price">¥{order.totalPrice.toFixed(2)}</span>
                  </div>
                  {order.status === '待处理' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleStatusChange(order._id, '已完成')}
                      >
                        完成订单
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(order._id, '已取消')}
                      >
                        取消订单
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
