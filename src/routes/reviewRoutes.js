const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, upload.array('images', 3), reviewValidation, validate, addReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
