const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 连接 MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB 连接成功');
})
.catch((err) => {
  console.error('❌ MongoDB 连接失败:', err);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
});
