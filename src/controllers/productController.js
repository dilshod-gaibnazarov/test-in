const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary, getPagination, getPaginationMeta, buildFilter, buildSort } = require('../utils/helpers');

// Barcha mahsulotlarni olish (filtrlash va qidiruv bilan)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 12);
    const filter = buildFilter(req.query);
    const sort = buildSort(req.query.sortBy, req.query.order);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo rating')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);
    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      data: products,
      meta
    });
  } catch (error) {
    next(error);
  }
};

// Bitta mahsulotni olish
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo rating email phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Mahsulot yaratish (Seller/Admin)
exports.createProduct = async (req, res, next) => {
  try {
    // Rasmlarni yuklash
    let images = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, 'gul-market/products');
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    const productData = {
      ...req.body,
      images,
      seller: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Mahsulotni yangilash (Seller/Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    // Faqat sotuvchi yoki admin yangilashi mumkin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu mahsulotni yangilash huquqingiz yo\'q'
      });
    }

    // Yangi rasmlarni yuklash
    if (req.files && req.files.length > 0) {
      const newImages = [];
      
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, 'gul-market/products');
        newImages.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }

      // Agar deleteOldImages true bo'lsa, eski rasmlarni o'chirish
      if (req.body.deleteOldImages === 'true') {
        for (const image of product.images) {
          await deleteFromCloudinary(image.public_id);
        }
        req.body.images = newImages;
      } else {
        req.body.images = [...product.images, ...newImages];
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Mahsulotni o'chirish (Seller/Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    // Faqat sotuvchi yoki admin o'chirishi mumkin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu mahsulotni o\'chirish huquqingiz yo\'q'
      });
    }

    // Rasmlarni cloudinary dan o'chirish
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Mahsulot muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Sotuvchining mahsulotlarini olish
exports.getSellerProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 12);

    const products = await Product.find({ seller: req.user._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ seller: req.user._id });
    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      data: products,
      meta
    });
  } catch (error) {
    next(error);
  }
};

// Mashhur mahsulotlar
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo')
      .limit(8);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Yangi mahsulotlar
exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Chegirmadagi mahsulotlar
exports.getSaleProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      discountPrice: { $exists: true, $ne: null }
    })
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo')
      .limit(8);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// O'xshash mahsulotlar
exports.getSimilarProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo')
      .limit(4);

    res.status(200).json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    next(error);
  }
};
