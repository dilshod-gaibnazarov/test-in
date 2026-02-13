const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token tekshirish
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Tizimga kirish talab qilinadi'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hisobingiz bloklangan'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token yaroqsiz yoki muddati tugagan'
    });
  }
};

// Rollarni tekshirish
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu amalni bajarish uchun ruxsatingiz yo\'q'
      });
    }
    next();
  };
};

// Seller yoki admin tekshirish
exports.sellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu amalni bajarish uchun sotuvchi yoki admin bo\'lishingiz kerak'
    });
  }
  next();
};

// O'z mahsulotini tekshirish
exports.checkProductOwner = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    // Admin yoki mahsulot egasi
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu mahsulotni tahrirlash huquqingiz yo\'q'
      });
    }

    req.product = product;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};
