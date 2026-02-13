const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadToCloudinary } = require('../utils/helpers');

// Mahsulot uchun sharhlarni olish
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// Sharh qo'shish
exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Mahsulotni tekshirish
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi'
      });
    }

    // Foydalanuvchi bu mahsulotni sotib olganmi tekshirish
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    // Rasmlarni yuklash
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, 'gul-market/reviews');
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    // Sharh yaratish
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      images,
      isVerifiedPurchase: !!hasPurchased
    });

    // Mahsulot reytingini yangilash
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    product.rating = avgRating;
    product.numReviews = reviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Siz allaqachon bu mahsulotga sharh qoldirgan'
      });
    }
    next(error);
  }
};

// Sharhni foydali deb belgilash
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Sharh topilmadi'
      });
    }

    const alreadyMarked = review.helpfulBy.includes(req.user._id);

    if (alreadyMarked) {
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== req.user._id.toString()
      );
      review.helpful -= 1;
    } else {
      review.helpfulBy.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};
