const bcrypt = require("bcryptjs");
const { response } = require("express");
const { AppError } = require("../helpers/appError");
const { catchAsync } = require("../helpers/catchAsync");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const ProductInCart = require("../models/productInCart.model");

const protectToken = catchAsync(async (req, res = response, next) => {

  let token

  //extract token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Session invalid', 403));
  }

  const decoded = await jwt.verify(token, process.env.SECRET_JWT_SEED);

  const user = await User.findOne({ where: { id: decoded.id, status: true } });

  if (!user) {
    return next(new AppError('The owner of this token is not longer available', 403))
  }

  req.sessionUser = user;

  next();

});

const existUserWithEmail = catchAsync(async (req, res = response, next) => {

  let { username, email, password, role = "normal" } = req.body

  username = username.toLowerCase()
  email = email.toLowerCase();

  const user = await User.findOne({ where: { email, status: true } });

  if (user) {
    return next(new AppError('There is already a user with that email', 400));
  }

  req.user = { username, email, password, role };

  next();

});

const accessUserWithEmail = catchAsync(async (req, res = response, next) => {
  const { email } = req.body

  const user = await User.findOne({ where: { email, status: true } });

  if (!user) {
    return next(new AppError('The user is not registered', 400));
  }

  req.user = user;

  next()
});

const existUserByIdParams = catchAsync(async (req, res = response, next) => {
  const { id } = req.params;

  const user = await User.findOne({ where: { id, status: true } });

  if (!user) {
    return next(new AppError('The user is not registered', 400));
  }

  req.user = user;
  next()
});

const protectAccountOwner = catchAsync(async (req, res = response, next) => {

  const { user, sessionUser } = req;

  if (user.id !== sessionUser.id) {
    return next(new AppError('You do not own this account', 403))
  }

  next();
});

const validPassword = catchAsync(async (req, res = response, next) => {

  const { user } = req;
  const { email, password } = req.body

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credential', 400));
  }

  next();
});

const validIsAdmin = catchAsync(async (req, res = response, next) => {

  const { sessionUser } = req;

  if (sessionUser.role !== 'admin') {
    return next(new AppError('you do not have administrator permissions', 403));
  }

  next()

});

const validExistOrder = catchAsync(async (req, res = response, next) => {

  const { id } = req.params;
  const { sessionUser } = req;

  const order = await Order.findOne({
    where: {
      id,
      userId: sessionUser.id,
      status: true
    }, attributes: { exclude: ['status'] },
    include: [{
      model: Cart, attributes: { exclude: ['status'] },
      include: [{
        model: ProductInCart, where: {
          status: 'purchased'
        }
      }]
    }]
  })

  if (!order) {
    return next(new AppError('order not found', 404))
  }

  req.order = order;
  next()
})

module.exports = {
  protectToken,
  existUserWithEmail,
  accessUserWithEmail,
  existUserByIdParams,
  protectAccountOwner,
  validPassword,
  validIsAdmin,
  validExistOrder
}