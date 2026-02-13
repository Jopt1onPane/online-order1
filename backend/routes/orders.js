const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authenticateMerchant } = require('../middleware/auth');

const router = express.Router();

// 创建订单（公开接口，用户端使用）
router.post('/', async (req, res) => {
  try {
    const { items, customerInfo, merchantId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '订单项不能为空' });
    }

    if (!merchantId) {
      return res.status(400).json({ error: '商家ID是必填项' });
    }

    // 验证菜品并计算总价
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      
      if (!menuItem) {
        return res.status(400).json({ error: `菜品 ${item.menuItemId} 不存在` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ error: `菜品 ${menuItem.name} 已下架` });
      }

      if (menuItem.merchantId.toString() !== merchantId) {
        return res.status(400).json({ error: '订单包含不属于该商家的菜品' });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // 生成订单号
    const orderNumber = Order.generateOrderNumber();

    // 创建订单
    const order = new Order({
      orderNumber,
      items: orderItems,
      totalPrice,
      merchantId,
      customerInfo: customerInfo || {}
    });

    await order.save();

    // 填充菜品信息返回
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItemId')
      .populate('merchantId', 'shopName');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取商家所有订单（需要商家认证）
router.get('/merchant/my-orders', authenticateMerchant, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { merchantId: req.merchant._id };
    
    if (status && status !== '全部') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个订单详情（需要商家认证）
router.get('/:id', authenticateMerchant, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItemId')
      .populate('merchantId', 'shopName');

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 验证是否为该商家的订单
    if (order.merchantId._id.toString() !== req.merchant._id.toString()) {
      return res.status(403).json({ error: '无权查看此订单' });
    }

    res.json(order);
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新订单状态（需要商家认证）
router.patch('/:id/status', authenticateMerchant, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 验证是否为该商家的订单
    if (order.merchantId.toString() !== req.merchant._id.toString()) {
      return res.status(403).json({ error: '无权修改此订单' });
    }

    if (!['待处理', '已完成', '已取消'].includes(status)) {
      return res.status(400).json({ error: '无效的订单状态' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
