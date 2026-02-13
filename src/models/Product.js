const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mahsulot nomi kiritilishi shart'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Mahsulot tavsifi kiritilishi shart']
  },
  price: {
    type: Number,
    required: [true, 'Narx kiritilishi shart'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    public_id: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategoriya tanlanishi shart']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stock: {
    type: Number,
    required: [true, 'Ombordagi miqdor kiritilishi shart'],
    min: 0,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: [{
    key: String,
    value: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Slug yaratish
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// Virtual field - chegirmali narx bormi
productSchema.virtual('hasDiscount').get(function() {
  return this.discountPrice && this.discountPrice < this.price;
});

// Virtual field - chegirma foizi
productSchema.virtual('discountPercentage').get(function() {
  if (this.hasDiscount) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual field - haqiqiy narx
productSchema.virtual('finalPrice').get(function() {
  return this.hasDiscount ? this.discountPrice : this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
