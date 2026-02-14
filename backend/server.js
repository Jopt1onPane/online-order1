const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件：支持多个前端来源（用逗号分隔），并默认放行所有 *.vercel.app（含预览部署）
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3001'];
const allowVercelPreview = process.env.CORS_ALLOW_VERCEL !== 'false'; // 默认 true，允许任意 xxx.vercel.app
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (allowVercelPreview && (origin.endsWith('.vercel.app') || origin === 'https://vercel.com')) {
      return callback(null, true);
    }
    callback(null, false);
  },
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

// 健康检查（含数据库连接状态，便于排查）
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=断开 1=已连接 2=连接中 3=断开中
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'db_disconnected',
    message: dbOk ? 'Server is running' : 'Database not connected',
    dbConnected: dbOk,
  });
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
