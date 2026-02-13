const { body, validationResult } = require('express-validator');

// Validatsiya natijalarini tekshirish
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Ro'yxatdan o'tish validatsiyasi
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Ism kiritilishi shart')
    .isLength({ min: 2 }).withMessage('Ism kamida 2 ta belgidan iborat bo\'lishi kerak'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email kiritilishi shart')
    .isEmail().withMessage('Email formati noto\'g\'ri'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Telefon raqam kiritilishi shart')
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).withMessage('Telefon raqam formati noto\'g\'ri'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Parol kiritilishi shart')
    .isLength({ min: 6 }).withMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
];

// Kirish validatsiyasi
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email kiritilishi shart')
    .isEmail().withMessage('Email formati noto\'g\'ri'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Parol kiritilishi shart')
];

// Mahsulot validatsiyasi
exports.productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Mahsulot nomi kiritilishi shart')
    .isLength({ min: 3 }).withMessage('Mahsulot nomi kamida 3 ta belgidan iborat bo\'lishi kerak'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Mahsulot tavsifi kiritilishi shart')
    .isLength({ min: 10 }).withMessage('Tavsif kamida 10 ta belgidan iborat bo\'lishi kerak'),
  
  body('price')
    .notEmpty().withMessage('Narx kiritilishi shart')
    .isFloat({ min: 0 }).withMessage('Narx musbat son bo\'lishi kerak'),
  
  body('category')
    .notEmpty().withMessage('Kategoriya tanlanishi shart'),
  
  body('stock')
    .notEmpty().withMessage('Ombordagi miqdor kiritilishi shart')
    .isInt({ min: 0 }).withMessage('Miqdor 0 dan katta bo\'lishi kerak')
];

// Buyurtma validatsiyasi
exports.orderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Kamida bitta mahsulot tanlanishi kerak'),
  
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('To\'liq ism kiritilishi shart'),
  
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Telefon raqam kiritilishi shart'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Ko\'cha manzili kiritilishi shart'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('Shahar kiritilishi shart'),
  
  body('shippingAddress.region')
    .trim()
    .notEmpty().withMessage('Viloyat kiritilishi shart')
];

// Sharh validatsiyasi
exports.reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Reyting kiritilishi shart')
    .isInt({ min: 1, max: 5 }).withMessage('Reyting 1 dan 5 gacha bo\'lishi kerak'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Sharh kiritilishi shart')
    .isLength({ min: 10 }).withMessage('Sharh kamida 10 ta belgidan iborat bo\'lishi kerak')
];
