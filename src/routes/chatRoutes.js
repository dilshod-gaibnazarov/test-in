const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  getUserChats,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createOrGetChat);
router.get('/my-chats', protect, getUserChats);
router.post('/:chatId/message', protect, sendMessage);
router.put('/:chatId/read', protect, markAsRead);

module.exports = router;
