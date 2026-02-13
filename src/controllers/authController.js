const User = require('../models/User');
const { sendTokenResponse } = require('../utils/token');
const { sendWelcomeEmail } = require('../utils/email');

// Ro'yxatdan o'tish
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Foydalanuvchi mavjudligini tekshirish
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email yoki telefon raqam allaqachon ro\'yxatdan o\'tgan'
      });
    }

    // Yangi foydalanuvchi yaratish
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'client'
    });

    // Xush kelibsiz emailini yuborish
    await sendWelcomeEmail(user);

    // Token bilan javob qaytarish
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Kirish
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Foydalanuvchini topish
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Parolni tekshirish
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Hisobni tekshirish
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hisobingiz bloklangan. Iltimos, administrator bilan bog\'laning'
      });
    }

    // Token bilan javob qaytarish
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Chiqish
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Tizimdan chiqildi'
    });
  } catch (error) {
    next(error);
  }
};

// Joriy foydalanuvchi ma'lumotlarini olish
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Profilni yangilash
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address
    };

    // Sotuvchi uchun qo'shimcha maydonlar
    if (req.user.role === 'seller') {
      fieldsToUpdate.shopName = req.body.shopName;
      fieldsToUpdate.shopDescription = req.body.shopDescription;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Parolni yangilash
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Joriy parolni tekshirish
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Joriy parol noto\'g\'ri'
      });
    }

    // Yangi parolni o'rnatish
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Parolni tiklash uchun email yuborish
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu email bilan foydalanuvchi topilmadi'
      });
    }

    // Bu yerda parolni tiklash linki yuborilishi kerak
    // Hozircha oddiy javob qaytaramiz
    res.status(200).json({
      success: true,
      message: 'Parolni tiklash yo\'riqlari emailingizga yuborildi'
    });
  } catch (error) {
    next(error);
  }
};
