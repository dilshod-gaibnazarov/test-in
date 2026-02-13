// Payme va Click to'lov tizimi konfiguratsiyasi
const crypto = require('crypto');

const paymentConfig = {
  payme: {
    merchantId: process.env.PAYME_MERCHANT_ID,
    secretKey: process.env.PAYME_SECRET_KEY,
    endpoint: 'https://checkout.paycom.uz',
    
    // Payme uchun authorization header yaratish
    generateAuthorization: function() {
      const auth = `Paycom:${this.secretKey}`;
      return `Basic ${Buffer.from(auth).toString('base64')}`;
    }
  },
  
  click: {
    merchantId: process.env.CLICK_MERCHANT_ID,
    secretKey: process.env.CLICK_SECRET_KEY,
    endpoint: 'https://my.click.uz/services/pay',
    
    // Click uchun sign yaratish
    generateSign: function(params) {
      const signString = Object.values(params).join('') + this.secretKey;
      return crypto.createHash('md5').update(signString).digest('hex');
    }
  }
};

module.exports = paymentConfig;
