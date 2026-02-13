const nodemailer = require('nodemailer');

// Email transporter yaratish
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Xush kelibsiz emaili
exports.sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `Gul Market <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Gul Market ga xush kelibsiz!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Assalomu alaykum, ${user.name}!</h2>
        <p>Gul Market platformasiga xush kelibsiz! Hisobingiz muvaffaqiyatli yaratildi.</p>
        <p>Bizning platformamizda siz:</p>
        <ul>
          <li>Turli xil gullar va suvenirlarni ko'rishingiz</li>
          <li>Online buyurtma berishingiz</li>
          <li>Tez yetkazib berish xizmatidan foydalanishingiz mumkin</li>
        </ul>
        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Xarid qilishni boshlash
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Hurmat bilan,<br>
          Gul Market jamoasi
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Xush kelibsiz emaili yuborildi:', user.email);
  } catch (error) {
    console.error('Email yuborishda xatolik:', error);
  }
};

// Buyurtma tasdiqlash emaili
exports.sendOrderConfirmation = async (order, user) => {
  const mailOptions = {
    from: `Gul Market <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Buyurtma tasdiqlandi - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Buyurtmangiz qabul qilindi!</h2>
        <p>Hurmatli ${user.name},</p>
        <p>Buyurtma raqami: <strong>${order.orderNumber}</strong></p>
        <p>Jami summa: <strong>${order.totalPrice.toLocaleString()} so'm</strong></p>
        
        <h3>Mahsulotlar:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} - ${item.quantity} dona (${(item.price * item.quantity).toLocaleString()} so'm)</li>
          `).join('')}
        </ul>
        
        <h3>Yetkazib berish manzili:</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
          Tel: ${order.shippingAddress.phone}
        </p>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Buyurtmani ko'rish
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Hurmat bilan,<br>
          Gul Market jamoasi
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Buyurtma emaili yuborildi:', user.email);
  } catch (error) {
    console.error('Email yuborishda xatolik:', error);
  }
};

// Buyurtma holati o'zgarganda
exports.sendOrderStatusUpdate = async (order, user, newStatus) => {
  const statusMessages = {
    confirmed: 'tasdiqlandi',
    processing: 'tayyorlanmoqda',
    shipped: 'yo\'lga chiqdi',
    delivered: 'yetkazildi',
    cancelled: 'bekor qilindi'
  };

  const mailOptions = {
    from: `Gul Market <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Buyurtma holati yangilandi - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Buyurtma holati yangilandi</h2>
        <p>Hurmatli ${user.name},</p>
        <p>Buyurtma raqami: <strong>${order.orderNumber}</strong></p>
        <p>Yangi holat: <strong style="text-transform: uppercase;">${statusMessages[newStatus]}</strong></p>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Batafsil ma'lumot
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Hurmat bilan,<br>
          Gul Market jamoasi
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email yuborishda xatolik:', error);
  }
};
