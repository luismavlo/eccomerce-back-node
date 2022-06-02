const bcryptjs = require("bcryptjs");
const { catchAsync } = require("../helpers/catchAsync");
const { generateJWT } = require("../helpers/jwt");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const ProductInCart = require("../models/productInCart.model");
const User = require("../models/user.model");

// require('crypto').randomBytes(64).toString('hex')

const createUser = catchAsync(async (req, res = response, next) => {

  let { username, email, password, role } = req.user;

  username = username.toLowerCase();

  const user = new User({ username, email, password, role });

  const salt = bcryptjs.genSaltSync();
  user.password = bcryptjs.hashSync(password, salt);

  await user.save();

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: 'success',
    uid: user.id,
    token
  });
});


const login = catchAsync(async (req, res = response, next) => {

  const { user } = req;

  const token = await generateJWT(user.id)

  res.json({
    status: 'success',
    token,
    user: {
      username: user.username,
      uid: user.id
    }
  });
});


const getMyProducts = catchAsync(async (req, res = response, next) => {

  const { sessionUser } = req;

  const products = await Product.findAll({
    where: {
      userId: sessionUser.id
    }, attributes: { exclude: ['status', 'userId'] }
  })

  res.json({
    status: 'success',
    products
  });
});


const getMyOrders = catchAsync(async (req, res = response, next) => {

  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: {
      userId: sessionUser.id
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

  res.json({
    status: 'success',
    orders
  });
});


const updateUser = catchAsync(async (req, res = response, next) => {

  const { username, email } = req.body;

  const { user } = req;

  await user.update({ username, email });

  res.json({
    status: 'success',
    message: 'successfully updated user'
  });
});


const deleteUser = catchAsync(async (req, res = response, next) => {

  const { user } = req;

  await user.update({ status: false });

  res.json({
    status: 'success',
    message: 'successfully inactive user'
  });
});


const getDetailOrder = catchAsync(async (req, res = response, next) => {

  const { order } = req;

  res.json({
    status: 'success',
    order
  });
});



module.exports = {
  createUser,
  login,
  getMyProducts,
  getMyOrders,
  updateUser,
  deleteUser,
  getDetailOrder,
}