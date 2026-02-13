# Gul Market - Backend

## O'rnatish

### 1. Node.js paketlarini o'rnatish
```bash
cd backend
npm install
```

### 2. MongoDB o'rnatish va ishga tushirish
MongoDB lokal kompyuteringizda o'rnatilgan bo'lishi kerak yoki MongoDB Atlas cloud servicidan foydalanishingiz mumkin.

### 3. Environment o'zgaruvchilarini sozlash
`.env` faylini tahrirlang va o'z ma'lumotlaringizni kiriting:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gul-market

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary (rasm yuklash uchun - https://cloudinary.com da ro'yxatdan o'ting)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Serverni ishga tushirish

Development rejimida:
```bash
npm run dev
```

Production rejimida:
```bash
npm start
```

Server `http://localhost:5000` manzilida ishga tushadi.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Ro'yxatdan o'tish
- POST `/api/auth/login` - Kirish
- GET `/api/auth/logout` - Chiqish
- GET `/api/auth/me` - Joriy foydalanuvchi ma'lumotlari
- PUT `/api/auth/update-profile` - Profilni yangilash
- PUT `/api/auth/update-password` - Parolni yangilash

### Products
- GET `/api/products` - Barcha mahsulotlar
- GET `/api/products/:id` - Bitta mahsulot
- POST `/api/products` - Mahsulot yaratish (Seller/Admin)
- PUT `/api/products/:id` - Mahsulotni yangilash (Seller/Admin)
- DELETE `/api/products/:id` - Mahsulotni o'chirish (Seller/Admin)
- GET `/api/products/featured` - Mashhur mahsulotlar
- GET `/api/products/new-arrivals` - Yangi mahsulotlar
- GET `/api/products/on-sale` - Chegirmadagi mahsulotlar

### Categories
- GET `/api/categories` - Barcha kategoriyalar
- GET `/api/categories/:id` - Bitta kategoriya
- POST `/api/categories` - Kategoriya yaratish (Admin)
- PUT `/api/categories/:id` - Kategoriyani yangilash (Admin)
- DELETE `/api/categories/:id` - Kategoriyani o'chirish (Admin)

### Orders
- POST `/api/orders` - Buyurtma yaratish
- GET `/api/orders/my-orders` - Mening buyurtmalarim
- GET `/api/orders/:id` - Bitta buyurtma
- PUT `/api/orders/:id/status` - Buyurtma holatini yangilash (Seller/Admin)
- PUT `/api/orders/:id/cancel` - Buyurtmani bekor qilish

### Reviews
- GET `/api/reviews/product/:productId` - Mahsulot sharhlari
- POST `/api/reviews/product/:productId` - Sharh qo'shish
- PUT `/api/reviews/:id/helpful` - Sharhni foydali deb belgilash

### Admin
- GET `/api/admin/dashboard` - Dashboard statistikasi
- GET `/api/admin/users` - Barcha foydalanuvchilar
- PUT `/api/admin/users/:id/role` - Foydalanuvchi rolini o'zgartirish
- PUT `/api/admin/users/:id/toggle-status` - Foydalanuvchini bloklash/blokdan chiqarish

## Ma'lumotlar bazasi modellari

- **User** - Foydalanuvchilar (client, seller, admin)
- **Product** - Mahsulotlar
- **Category** - Kategoriyalar
- **Order** - Buyurtmalar
- **Review** - Sharhlar
- **Chat** - Chat xabarlari

## Xususiyatlar

✅ JWT autentifikatsiya
✅ Role-based access control (Client, Seller, Admin)
✅ Rasm yuklash (Cloudinary)
✅ Email bildirnomalari
✅ Mahsulot qidiruv va filtrlash
✅ Buyurtma boshqaruvi
✅ Sharh va reyting tizimi
✅ Real-time chat (Socket.IO)
✅ Admin dashboard
✅ Seller dashboard

## Texnologiyalar

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT
- Bcrypt.js
- Multer & Cloudinary
- Nodemailer
- Socket.IO
- Express Validator

## Support

Savollar uchun: gulmarket@support.uz
