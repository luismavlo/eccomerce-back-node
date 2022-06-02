const { response } = require("express");
const { AppError } = require("../helpers/appError");
const { catchAsync } = require("../helpers/catchAsync");
const Category = require("../models/category.model");


const existCategoryByIdParams = catchAsync(async (req, res = response, next) => {

  const { id } = req.params;

  const category = await Category.findOne({
    where: {
      id,
      status: true
    }
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  };

  req.category = category;

  next();

});

const validExistNameCategory = catchAsync(async (req, res = response, next) => {

  let { name } = req.body;

  name = name.toLowerCase();

  const category = await Category.findOne({
    where: {
      name
    }
  });

  if (category) {
    return next(new AppError('There is already a category with that name', 400));
  };

  req.category = { name };

  next()

});

const validateExistCategoryForProduct = catchAsync(async (req, res = response, next) => {
  const { categoryId } = req.body;
  console.log(categoryId);

  const category = await Category.findOne({
    where: {
      id: categoryId,
      status: true
    }
  })

  if (!category) {
    next(new AppError('There is no category with that id', 400))
  }

  next()
})

module.exports = {
  existCategoryByIdParams,
  validExistNameCategory,
  validateExistCategoryForProduct
}