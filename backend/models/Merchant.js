const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const merchantSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 密码加密中间件
merchantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 密码验证方法
merchantSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Merchant', merchantSchema);
