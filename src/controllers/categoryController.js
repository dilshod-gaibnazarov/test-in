const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/helpers');

// Barcha kategoriyalarni olish
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Bitta kategoriyani olish
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategoriya yaratish (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    let imageUrl = req.body.image;

    // Agar rasm yuklangan bo'lsa
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'gul-market/categories');
      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      ...req.body,
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategoriyani yangilash (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi'
      });
    }

    // Agar yangi rasm yuklangan bo'lsa
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'gul-market/categories');
      req.body.image = result.secure_url;
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategoriyani o'chirish (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi'
      });
    }

    // Kategoriyada mahsulot bor-yo'qligini tekshirish
    const productCount = await Product.countDocuments({ category: req.params.id });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategoriyada ${productCount} ta mahsulot mavjud. Avval mahsulotlarni boshqa kategoriyaga ko'chiring yoki o'chiring.`
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Kategoriya muvaffaqiyatli o\'chirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Kategoriya bo'yicha mahsulotlar
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategoriya topilmadi'
      });
    }

    const products = await Product.find({ 
      category: req.params.id, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .populate('seller', 'name shopName shopLogo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
