const multer = require('multer');
const path = require('path');

// Xotiraga saqlash
const storage = multer.memoryStorage();

// Fayl filterini tekshirish
const fileFilter = (req, file, cb) => {
  // Ruxsat berilgan fayl turlari
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Faqat rasm fayllari (JPEG, JPG, PNG, GIF, WEBP) yuklanishi mumkin'));
  }
};

// Multer konfiguratsiyasi
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
