const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['待处理', '已完成', '已取消'],
    default: '待处理'
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  customerInfo: {
    name: String,
    phone: String,
    address: String,
    note: String
  }
}, {
  timestamps: true
});

// 生成订单号
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

module.exports = mongoose.model('Order', orderSchema);
