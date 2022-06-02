const { response } = require("express");
const { AppError } = require("../helpers/appError");
const { catchAsync } = require("../helpers/catchAsync");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ProductInCart = require("../models/productInCart.model");


const validExistCart = catchAsync(async (req, res = response, next) => {

  const { sessionUser } = req;

  let cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: 'active'
    }
  });

  if (!cart) {
    cart = await Cart.create({ userId: sessionUser.id })
  }

  req.cart = cart;
  next();
});

const validExistProductOnCart = catchAsync(async (req, res = response, next) => {

  const { product, cart } = req;

  const productInCart = await ProductInCart.findOne({
    where: {
      cartId: cart.id,
      productId: product.id
    }
  });

  if (productInCart && productInCart.status === 'removed') {
    await ProductInCart.update({ status: 'active' });
    return res.json({
      message: 'product successfully added'
    })
  }

  if (productInCart) {
    return next(new AppError('This product already exists in the cart', 400))
  }

  req.productInCart = productInCart;

  next();

});

const validExistProductInCartForUpdate = catchAsync(async (req, res = response, next) => {

  const { productId } = req.body;
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: 'active'
    }
  });

  const productInCart = await ProductInCart.findOne({
    where: {
      cartId: cart.id,
      productId,
    }
  });

  if (!productInCart) {
    return next(new AppError('The product does not exist in the cart', 400))
  }

  req.productInCart = productInCart;

  next();

})

const validExistProductIdByParams = catchAsync(async (req, res = response, next) => {
  const { productId } = req.params;

  const product = await Product.findOne({
    where: {
      id: productId,
      status: true
    }
  });

  if (!product) {
    return next(new AppError('there is no id with that product', 404))
  }

  next();
});

const validExistProductInCartByParams = catchAsync(async (req, res = response, next) => {
  const { productId } = req.params;

  const productInCart = await ProductInCart.findOne({
    where: {
      productId,
      status: 'active'
    }
  })

  if (!productInCart) {
    return next(new AppError('This product does not exist in the cart', 404))
  }

  req.productInCart = productInCart;
  next();
})

module.exports = {
  validExistCart,
  validExistProductOnCart,
  validExistProductIdByParams,
  validExistProductInCartForUpdate,
  validExistProductInCartByParams
}