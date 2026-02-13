const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism kiritilishi shart'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email kiritilishi shart'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email formati noto\'g\'ri']
  },
  phone: {
    type: String,
    required: [true, 'Telefon raqam kiritilishi shart'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Parol kiritilishi shart'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'seller', 'admin'],
    default: 'client'
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  address: {
    street: String,
    city: String,
    region: String,
    zipCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Sotuvchi uchun qo'shimcha ma'lumotlar
  shopName: {
    type: String,
    trim: true
  },
  shopDescription: {
    type: String
  },
  shopLogo: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Parolni hash qilish
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Parolni tekshirish
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
