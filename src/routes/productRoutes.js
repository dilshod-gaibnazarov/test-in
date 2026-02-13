const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
  getSimilarProducts
} = require('../controllers/productController');
const { protect, sellerOrAdmin, checkProductOwner } = require('../middleware/auth');
const { productValidation, validate } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/on-sale', getSaleProducts);
router.get('/seller/my-products', protect, sellerOrAdmin, getSellerProducts);
router.get('/:id', getProduct);
router.get('/:id/similar', getSimilarProducts);
router.post('/', protect, sellerOrAdmin, upload.array('images', 5), productValidation, validate, createProduct);
router.put('/:id', protect, checkProductOwner, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, checkProductOwner, deleteProduct);

module.exports = router;
