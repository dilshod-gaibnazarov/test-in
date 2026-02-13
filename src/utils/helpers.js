const cloudinary = require('../config/cloudinary');

// Cloudinary ga rasm yuklash
exports.uploadToCloudinary = async (file, folder = 'gul-market') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error('Rasm yuklashda xatolik');
  }
};

// Cloudinary dan rasmni o'chirish
exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Rasm o\'chirishda xatolik:', error);
  }
};

// Paginatsiya
exports.getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip: skip
  };
};

// Pagination meta ma'lumotlarini yaratish
exports.getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

// Query parametrlarini filtrlash
exports.buildFilter = (query) => {
  const filter = {};

  // Kategoriya
  if (query.category) {
    filter.category = query.category;
  }

  // Narx oralig'i
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Reyting
  if (query.rating) {
    filter.rating = { $gte: Number(query.rating) };
  }

  // Qidiruv
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(query.search, 'i')] } }
    ];
  }

  // Faqat omborda bor mahsulotlar
  if (query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  // Chegirmadagi mahsulotlar
  if (query.onSale === 'true') {
    filter.discountPrice = { $exists: true, $ne: null };
  }

  // Faol mahsulotlar
  filter.isActive = true;

  return filter;
};

// Sortlash parametrlarini yaratish
exports.buildSort = (sortBy = 'createdAt', order = 'desc') => {
  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'name-asc': { name: 1 },
    'name-desc': { name: -1 },
    'rating-desc': { rating: -1 },
    'sold-desc': { sold: -1 },
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 }
  };

  return sortOptions[sortBy] || { [sortBy]: order === 'asc' ? 1 : -1 };
};

// Random string generator
exports.generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2).toUpperCase();
};

// Telefon raqamni formatlash
exports.formatPhoneNumber = (phone) => {
  // +998 91 234 56 78 formatiga o'tkazish
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('998')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10)}`;
  }
  
  return phone;
};

// Narxni formatlash
exports.formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(price);
};

// Sana formatlash
exports.formatDate = (date) => {
  return new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};
