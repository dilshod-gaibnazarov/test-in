// Xatoliklarni boshqarish middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log qilish
  console.error(err);

  // Mongoose noto'g'ri ObjectId
  if (err.name === 'CastError') {
    const message = 'Resurs topilmadi';
    error = { message, statusCode: 404 };
  }

  // Mongoose takroriy kalit xatosi
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Bu ${field} allaqachon mavjud`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation xatosi
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT xatosi
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token yaroqsiz';
    error = { message, statusCode: 401 };
  }

  // JWT muddati tugagan
  if (err.name === 'TokenExpiredError') {
    const message = 'Token muddati tugagan';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server xatosi',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 xatosi
const notFound = (req, res, next) => {
  const error = new Error(`Yo'l topilmadi - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
