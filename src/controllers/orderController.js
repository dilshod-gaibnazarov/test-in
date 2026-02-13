const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/email');
const { getPagination, getPaginationMeta } = require('../utils/helpers');

// Buyurtma yaratish
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Mahsulotlarni tekshirish va narxlarni hisoblash
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Mahsulot topilmadi: ${item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Mahsulot sotuvda emas: ${product.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} uchun yetarli miqdor yo'q. Omborda: ${product.stock}`
        });
      }

      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        image: product.images[0]?.url || '',
        price: price,
        quantity: item.quantity
      });

      // Mahsulot miqdorini kamaytirish va sotilganini oshirish
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Yetkazib berish narxi (oddiy hisoblash)
    const shippingPrice = itemsPrice > 100000 ? 0 : 20000;
    const totalPrice = itemsPrice + shippingPrice;

    // Buyurtma yaratish
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      notes
    });

    // Buyurtma tasdiqlash emailini yuborish
    await sendOrderConfirmation(order, req.user);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Foydalanuvchining buyurtmalarini olish
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 10);

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .populate('items.seller', 'shopName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });
    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      data: orders,
      meta
    });
  } catch (error) {
    next(error);
  }
};

// Bitta buyurtmani olish
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .populate('items.seller', 'shopName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      });
    }

    // Faqat buyurtma egasi, sotuvchi yoki admin ko'rishi mumkin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bu buyurtmani ko\'rish huquqingiz yo\'q'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Buyurtma holatini yangilash (Admin/Seller)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      });
    }

    // Faqat admin yoki tegishli sotuvchi yangilashi mumkin
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bu buyurtmani yangilash huquqingiz yo\'q'
      });
    }

    // Holatni yangilash
    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveryDate = Date.now();
    }

    await order.save();

    // Email yuborish
    await sendOrderStatusUpdate(order, order.user, orderStatus);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Buyurtmani bekor qilish
exports.cancelOrder = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      });
    }

    // Faqat buyurtma egasi bekor qilishi mumkin
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu buyurtmani bekor qilish huquqingiz yo\'q'
      });
    }

    // Faqat pending yoki confirmed holatida bekor qilish mumkin
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Bu holatdagi buyurtmani bekor qilib bo\'lmaydi'
      });
    }

    // Mahsulotlarni qaytarish
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.sold -= item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = cancelReason;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Buyurtma bekor qilindi',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Sotuvchining buyurtmalarini olish
exports.getSellerOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 10);

    const orders = await Order.find({
      'items.seller': req.user._id
    })
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ 'items.seller': req.user._id });
    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      data: orders,
      meta
    });
  } catch (error) {
    next(error);
  }
};

// Barcha buyurtmalar (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 10);

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .populate('items.seller', 'shopName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);
    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      data: orders,
      meta
    });
  } catch (error) {
    next(error);
  }
};
