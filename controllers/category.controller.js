const { catchAsync } = require("../helpers/catchAsync");
const Category = require("../models/category.model");


const getCategories = catchAsync(async (req, res = response, next) => {

  const { page = 0, size = 10 } = req.query;

  let options = {
    limit: +size,
    offset: (+page) * (+size),
    where: {
      status: true
    }
  }

  const { count, rows } = await Category.findAndCountAll(options)


  res.json({
    status: 'success',
    total: count,
    categories: rows
  })
});


const createCategory = catchAsync(async (req, res = response, next) => {

  const { name } = req.category;

  const category = new Category({ name });

  await category.save();

  res.json({
    status: 'success',
    message: 'successfully create category'
  });
});


const getCategoryById = catchAsync(async (req, res = response, next) => {

  const { category } = req;

  category.status = undefined

  res.json({
    status: 'success',
    category
  });
});


const updateCategory = catchAsync(async (req, res = response, next) => {

  const { category } = req;

  const { name } = req.body;

  await category.update({ name })

  res.json({
    status: 'success'
  });
});


const deleteCategory = catchAsync(async (req, res = response, next) => {

  const { category } = req;

  await category.update({ status: false })

  res.json({
    status: 'success'
  });
});

module.exports = {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
}
