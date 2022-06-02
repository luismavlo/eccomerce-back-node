const { response } = require("express")
const { catchAsync } = require("../helpers/catchAsync");
const { Email } = require("../helpers/email");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const ProductInCart = require("../models/productInCart.model");


const addProductToCart = catchAsync(async (req, res = response, next) => {

  const { productId, quantity } = req.body;
  const { cart } = req

  console.log(productId, quantity, cart.id)

  const productInCart = await ProductInCart.create({
    cartId: cart.id,
    productId,
    quantity
  })

  res.json({
    status: 'success',
    productInCart
  });
});


const updateCart = catchAsync(async (req, res = response, next) => {

  const { newQty } = req.body;

  const { productInCart } = req;

  if (newQty === 0) {
    await productInCart.update({ quantity: newQty, status: 'removed' })
  } else {
    await productInCart.update({ quantity: newQty, status: 'active' })
  }

  res.json({
    status: 'success',
    message: 'successfully update product'
  });
});


const removeProductToCart = catchAsync(async (req, res = response, next) => {

  const { productInCart } = req;

  await productInCart.update({ quantity: 0, status: 'removed' })

  res.json({
    status: 'success',
    message: 'successfully delete product in cart'
  });
});


const buyProductsOnCart = catchAsync(async (req, res = response, next) => {

  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: {
      status: 'active'
    }, include: [{
      model: ProductInCart, where: {
        status: 'active'
      }, include: [{ model: Product }]
    }]
  });

  let totalPrice = 0

  cart.productInCarts.forEach(productInCart => {
    totalPrice += productInCart.quantity * productInCart.product.price;
  });


  const purchasedProductPromises = cart.productInCarts.map(async (productInCart) => {
    const product = await Product.findOne({ where: { id: productInCart.productId } });
    const newStock = product.quantity - productInCart.quantity;
    return await product.update({ quantity: newStock });
  });

  await Promise.all(purchasedProductPromises);

  const statusProductPromises = cart.productInCarts.map(async (productInCart) => {
    const productInC = await ProductInCart.findOne({ where: { id: productInCart.id } })
    return await productInC.update({ status: 'purchased' });
  });

  await Promise.all(statusProductPromises);

  await cart.update({ status: 'purchased' });

  const order = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice
  })

  const productsInCart = await ProductInCart.findAll({
    where: {
      cartId: order.cartId,
      status: 'purchased'
    }, include: [{ model: Product }]
  });


  await new Email(sessionUser.email).sendPurchase(order, productsInCart);



  res.json({
    status: 'success',
    order
  });
});

module.exports = {
  addProductToCart,
  updateCart,
  removeProductToCart,
  buyProductsOnCart
}

