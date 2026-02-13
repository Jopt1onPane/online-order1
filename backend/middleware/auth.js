const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');

// 商家认证中间件
const authenticateMerchant = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await Merchant.findById(decoded.merchantId).select('-password');
    
    if (!merchant) {
      return res.status(401).json({ error: '商家不存在' });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的认证令牌' });
  }
};

module.exports = { authenticateMerchant };
