const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MenuItem = require('../models/MenuItem');
const { authenticateMerchant } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置 multer（图片上传）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'));
    }
  }
});

// 获取所有菜品（公开接口，用户端使用）
// 条件：上架中，或未设置 isAvailable 的旧数据也显示
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = {
      $or: [
        { isAvailable: true },
        { isAvailable: { $exists: false } }
      ]
    };
    if (category && category !== '全部') {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query)
      .populate('merchantId', 'shopName')
      .sort({ createdAt: -1 });

    res.json(menuItems);
  } catch (error) {
    console.error('获取菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 按 ID 列表获取菜品（购物车等场景，减少请求量）
router.get('/by-ids', async (req, res) => {
  try {
    const idsStr = req.query.ids;
    if (!idsStr || typeof idsStr !== 'string') {
      return res.json([]);
    }
    const ids = idsStr.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) return res.json([]);
    const items = await MenuItem.find({
      _id: { $in: ids },
      $or: [{ isAvailable: true }, { isAvailable: { $exists: false } }]
    });
    res.json(items);
  } catch (error) {
    console.error('按ID获取菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个菜品详情
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('merchantId', 'shopName');
    
    if (!menuItem) {
      return res.status(404).json({ error: '菜品不存在' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error('获取菜品详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建菜品（需要商家认证）
router.post('/', authenticateMerchant, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: '名称、价格和分类是必填项' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const menuItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl,
      merchantId: req.merchant._id
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('创建菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新菜品（需要商家认证）
router.put('/:id', authenticateMerchant, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: '菜品不存在' });
    }

    // 验证是否为该商家的菜品
    if (menuItem.merchantId.toString() !== req.merchant._id.toString()) {
      return res.status(403).json({ error: '无权修改此菜品' });
    }

    if (name) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable === 'true' || isAvailable === true;

    // 如果上传了新图片，删除旧图片
    if (req.file) {
      if (menuItem.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', menuItem.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      menuItem.imageUrl = `/uploads/${req.file.filename}`;
    }

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    console.error('更新菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除菜品（需要商家认证）
router.delete('/:id', authenticateMerchant, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: '菜品不存在' });
    }

    // 验证是否为该商家的菜品
    if (menuItem.merchantId.toString() !== req.merchant._id.toString()) {
      return res.status(403).json({ error: '无权删除此菜品' });
    }

    // 删除图片文件
    if (menuItem.imageUrl) {
      const imagePath = path.join(__dirname, '..', menuItem.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await menuItem.deleteOne();
    res.json({ message: '菜品已删除' });
  } catch (error) {
    console.error('删除菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取商家自己的所有菜品（需要商家认证）
router.get('/merchant/my-items', authenticateMerchant, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ merchantId: req.merchant._id })
      .sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    console.error('获取商家菜品错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
