const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const ProductInCart = require('../models/productInCart.model');
const Product = require('../models/product.model');



class Email {
  constructor(to) {
    this.to = to;
  }
  // Create a connection with an email service
  createTransport() {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }



  async send(order, productsInCart, template, subject) {

    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      title: 'Compras en huawei store',
      totalPrice: order.totalPrice,
      productsInCart: productsInCart,
    });

    await this.createTransport().sendMail({
      from: 'lmavendano@gmail.com',
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async sendPurchase(order, productsInCart) {
    await this.send(order, productsInCart, 'purchase', 'Resumen de pedido');
  }
}

module.exports = { Email };