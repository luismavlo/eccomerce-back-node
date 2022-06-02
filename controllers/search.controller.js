const { response } = require("express");
const { AppError } = require("../helpers/appError");
const { catchAsync } = require("../helpers/catchAsync");
const User = require("../models/user.model");
const { Op } = require('sequelize');
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const ProductInCart = require("../models/productInCart.model");

const allowedCollections = [
  'users',
  'category',
  'products',
  'orders'
]

const searchUser = async (term = '', res) => {

  const newTerm = Number(term)

  if (newTerm >= 1) {
    const user = await User.findOne({
      where: {
        id: newTerm,
        status: true
      }, attributes: { exclude: ['status', 'password'] }
    })

    return res.json({
      results: (user) ? [user] : []
    })
  }

  const users = await User.findAll({
    where: {
      [Op.or]: [
        {
          username: {
            [Op.like]: `${term.toLocaleLowerCase()}%`
          }
        },
        {
          email: {
            [Op.like]: `${term.toLocaleLowerCase()}%`
          }
        }
      ]
    }, attributes: { exclude: ['status', 'password'] }
  })

  return res.json({
    results: users
  })
}

const searchCategory = async (term = '', res = response, next) => {

  const newTerm = Number(term);

  if (newTerm > 1) {
    const category = await Category.findOne({
      where: {
        id: newTerm,
        status: true
      }, attributes: { exclude: ['status'] }, include: [{
        model: Product, attributes: { exclude: ['status'] }
      }]
    })

    return res.json({
      results: (category) ? [category] : []
    })
  }

  const categories = await Category.findAll({
    where: {
      name: {
        [Op.like]: `${term.toLocaleLowerCase()}%`
      }
    }, attributes: { exclude: ['status'] }, include: [{
      model: Product, attributes: { exclude: ['status'] }
    }]
  });

  return res.json({
    results: categories
  })

}

const searchProduct = async (term = '', res = response, next) => {

  const newTerm = Number(term);

  if (newTerm > 1) {
    const product = await Product.findOne({
      where: {
        id: newTerm,
        status: true
      }, attributes: { exclude: ['status'] }
    })

    return res.json({
      results: (product) ? [product] : []
    })
  }

  const products = await Product.findAll({
    where: {
      title: {
        [Op.like]: `${term.toLocaleLowerCase()}%`
      }
    }, attributes: { exclude: ['status'] }
  });

  return res.json({
    results: products
  })

}

const searchOrder = async (term = '', res = response, next) => {

  const newTerm = Number(term);

  if (newTerm > 1) {
    const order = await Order.findOne({
      where: {
        id: newTerm,
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

    return res.json({
      results: (order) ? [order] : []
    })
  } else {
    return next(new AppError('the id needs to be a number', 400))
  }
}

const search = catchAsync(async (req, res = response, next) => {

  const { collection, term } = req.params;

  if (!allowedCollections.includes(collection)) {
    return next(new AppError(`Allowed collections are: ${allowedCollections}`, 400))
  }

  switch (collection) {
    case 'users':
      searchUser(term, res)
      break;

    case 'category':
      searchCategory(term, res)
      break;

    case 'products':
      searchProduct(term, res)
      break;

    case 'orders':
      searchOrder(term, res, next)
      break;

    default:
      return next(new AppError('Search case not found', 500))
  }

})

module.exports = {
  search
}