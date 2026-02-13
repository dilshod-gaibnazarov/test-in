require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Database ulanish
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Gul Market API ishlamoqda!',
    version: '1.0.0'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda...`);
});

// Socket.IO uchun (real-time chat)
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`Foydalanuvchi chatga qo'shildi: ${chatId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Xatolik: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
