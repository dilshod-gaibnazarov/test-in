const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/helpers');

// Profilni olish
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Avatar yuklash
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Rasm yuklanmadi'
      });
    }

    const result = await uploadToCloudinary(req.file, 'gul-market/avatars');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Shop logo yuklash (Seller)
exports.uploadShopLogo = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Faqat sotuvchilar do\'kon logosini yuklashi mumkin'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Rasm yuklanmadi'
      });
    }

    const result = await uploadToCloudinary(req.file, 'gul-market/shops');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { shopLogo: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
