const express = require('express');
const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');
const { authenticateMerchant } = require('../middleware/auth');

const router = express.Router();

// 商家注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, shopName, contactInfo } = req.body;

    // 验证输入
    if (!username || !password || !shopName) {
      return res.status(400).json({ error: '用户名、密码和店铺名称是必填项' });
    }

    // 检查用户名是否已存在
    const existingMerchant = await Merchant.findOne({ username });
    if (existingMerchant) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 创建商家
    const merchant = new Merchant({
      username,
      password,
      shopName,
      contactInfo
    });

    await merchant.save();

    // 生成 JWT token
    const token = jwt.sign(
      { merchantId: merchant._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      merchant: {
        id: merchant._id,
        username: merchant.username,
        shopName: merchant.shopName
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 商家登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }

    // 查找商家
    const merchant = await Merchant.findOne({ username });
    if (!merchant) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await merchant.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { merchantId: merchant._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      merchant: {
        id: merchant._id,
        username: merchant.username,
        shopName: merchant.shopName
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前商家信息
router.get('/me', authenticateMerchant, async (req, res) => {
  res.json({
    merchant: {
      id: req.merchant._id,
      username: req.merchant.username,
      shopName: req.merchant.shopName,
      contactInfo: req.merchant.contactInfo
    }
  });
});

module.exports = router;
