const { response } = require("express");
const { AppError } = require("../helpers/appError");
const { catchAsync } = require("../helpers/catchAsync");
const Product = require("../models/product.model");
const ProductImg = require("../models/productImg.model");
const User = require("../models/user.model");


const validateExistProductByParamsId = catchAsync(async (req, res = response, next) => {

  const { id } = req.params;

  const product = await Product.findOne({
    where: {
      id,
      status: true
    }, attributes: { exclude: ['status'] },
    include: [{
      model: User, attributes: {
        exclude: ['password', 'status', 'role']
      }
    }], include: [{
      model: ProductImg
    }]
  });

  if (!product) {
    return next(new AppError('Product not found', 404))
  }


  req.user = product.user
  req.product = product;

  next();

});

const validExistProductId = catchAsync(async (req, res = response, next) => {

  const { productId } = req.body;

  const product = await Product.findOne({
    where: {
      id: productId,
      status: true
    }
  })

  if (!product) {
    return next(new AppError('Product not found', 404))
  }

  req.product = product;

  next();

});

const validExistProductsInStock = catchAsync(async (req, res = response, next) => {

  const { quantity } = req.body;

  const { product } = req;

  if (quantity > product.quantity) {
    return next(new AppError('There are not enough products in the stock', 400))
  }

  next();
});

const validExistProductsInStockForUpdate = catchAsync(async (req, res = response, next) => {

  const { newQty } = req.body;

  const { product } = req;

  if (newQty > product.quantity) {
    return next(new AppError('There are not enough products in the stock', 400))
  }

  next();
});


module.exports = {
  validateExistProductByParamsId,
  validExistProductId,
  validExistProductsInStock,
  validExistProductsInStockForUpdate
}