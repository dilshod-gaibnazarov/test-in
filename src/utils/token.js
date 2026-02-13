const jwt = require('jsonwebtoken');

// JWT token yaratish
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Token bilan javob qaytarish
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = this.generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        shopName: user.shopName,
        shopLogo: user.shopLogo
      }
    });
};
