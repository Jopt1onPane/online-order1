# 餐厅点餐系统

一个类似外卖平台的餐厅点餐网站，包含用户端和商家端功能。

## 功能特性

### 用户端（公开访问）
- ✅ 浏览菜品（按分类：主菜、汤、小吃、饮料）
- ✅ 加入购物车
- ✅ 下单功能
- ✅ 无需登录即可使用

### 商家端（需要登录）
- ✅ 商家注册/登录
- ✅ 菜品管理（添加、编辑、删除）
- ✅ 上传菜品图片
- ✅ 查看订单列表
- ✅ 处理订单（完成/取消）

## 技术栈

### 前端
- React 18
- React Router
- Axios
- React Icons
- CSS3

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Multer（文件上传）

## 项目结构

```
项目根目录/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── pages/     # 页面组件
│   │   ├── components/ # 公共组件
│   │   ├── context/   # 状态管理
│   │   └── services/  # API 调用
│   └── package.json
├── backend/           # Node.js 后端
│   ├── routes/        # 路由
│   ├── models/        # 数据模型
│   ├── middleware/    # 中间件
│   └── server.js      # 入口文件
└── README.md
```

## 路由说明

### 用户端路由
- `/` - 首页（浏览菜品）
- `/cart` - 购物车
- `/order` - 下单页面

### 商家端路由
- `/admin/login` - 商家登录/注册
- `/admin/dashboard` - 商家后台首页
- `/admin/menu` - 菜品管理
- `/admin/orders` - 订单管理

## API 接口

### 认证相关
- `POST /api/auth/register` - 商家注册
- `POST /api/auth/login` - 商家登录
- `GET /api/auth/me` - 获取当前商家信息（需要认证）

### 菜品相关
- `GET /api/menu` - 获取所有菜品（公开）
- `GET /api/menu/:id` - 获取单个菜品详情
- `POST /api/menu` - 创建菜品（需要认证）
- `PUT /api/menu/:id` - 更新菜品（需要认证）
- `DELETE /api/menu/:id` - 删除菜品（需要认证）
- `GET /api/menu/merchant/my-items` - 获取商家自己的菜品（需要认证）

### 订单相关
- `POST /api/orders` - 创建订单（公开）
- `GET /api/orders/merchant/my-orders` - 获取商家订单列表（需要认证）
- `GET /api/orders/:id` - 获取订单详情（需要认证）
- `PATCH /api/orders/:id/status` - 更新订单状态（需要认证）

## 部署

详细部署教程请参考 [部署教程.md](./部署教程.md)

## 注意事项

1. **图片存储**：当前使用本地存储，生产环境建议使用云存储（如 Cloudinary）
2. **安全性**：生产环境请使用强密码和安全的 JWT_SECRET
3. **CORS**：部署时记得更新后端的 CORS 配置，允许前端域名访问
4. **数据库**：确保 MongoDB 连接字符串正确，网络访问已配置

## 许可证

MIT