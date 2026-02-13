const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getAllOrders
} = require('../controllers/orderController');
const { protect, sellerOrAdmin, authorize } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

router.post('/', protect, orderValidation, validate, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller/orders', protect, sellerOrAdmin, getSellerOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, sellerOrAdmin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
