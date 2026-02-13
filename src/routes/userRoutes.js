const express = require('express');
const router = express.Router();
const {
  getProfile,
  uploadAvatar,
  uploadShopLogo
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/upload-shop-logo', protect, upload.single('logo'), uploadShopLogo);

module.exports = router;
