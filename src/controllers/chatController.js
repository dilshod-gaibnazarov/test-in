const Chat = require('../models/Chat');

// Chat yaratish yoki olish
exports.createOrGetChat = async (req, res, next) => {
  try {
    const { participantId, productId } = req.body;

    // Mavjud chatni topish
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] },
      product: productId || null
    }).populate('participants', 'name avatar shopName')
      .populate('product', 'name images');

    // Agar yo'q bo'lsa, yangi chat yaratish
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        product: productId,
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('participants', 'name avatar shopName')
        .populate('product', 'name images');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// Foydalanuvchining barcha chatlarini olish
exports.getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar shopName')
      .populate('product', 'name images')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

// Xabar yuborish
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat topilmadi'
      });
    }

    // Foydalanuvchi chat a'zosi ekanligini tekshirish
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu chatga kirish huquqingiz yo\'q'
      });
    }

    // Xabar qo'shish
    chat.messages.push({
      sender: req.user._id,
      content
    });

    chat.lastMessage = content;
    chat.lastMessageAt = Date.now();

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name avatar shopName')
      .populate('product', 'name images');

    res.status(200).json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    next(error);
  }
};

// Xabarlarni o'qilgan deb belgilash
exports.markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat topilmadi'
      });
    }

    // Foydalanuvchiga yuborilgan barcha xabarlarni o'qilgan deb belgilash
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString() && !message.isRead) {
        message.isRead = true;
        message.readAt = Date.now();
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Xabarlar o\'qilgan deb belgilandi'
    });
  } catch (error) {
    next(error);
  }
};
