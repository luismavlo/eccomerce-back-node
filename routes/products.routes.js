const { Router } = require("express");
const { check, body } = require("express-validator");
const { createProduct, getAllProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller");
const { validateExistCategoryForProduct } = require("../middlewares/category.middleware");
const { validateExistProductByParamsId } = require("../middlewares/product.middleware");
const { protectToken, protectAccountOwner } = require("../middlewares/users.middlewares");
const { validateFields } = require("../middlewares/validate-fields");


const router = Router();

const { upload } = require('../helpers/multer')

router.get('/', getAllProduct);

router.get('/:id', validateExistProductByParamsId, getProductById);

router.use(protectToken)

router.post('/', [
  upload.array('productImgs', 3),
  check('title', 'The title in mandatory').notEmpty(),
  check('description', 'The description is mandatory').notEmpty(),
  check('price', 'The price is mandatory').not().isEmpty(),
  check('quantity', 'The quantity is mandatory').not().isEmpty(),
  check('categoryId', 'The categoryId is mandatory').not().isEmpty(),
  validateFields,
  validateExistCategoryForProduct,
], createProduct);

router.patch('/:id', [
  check('title', 'The title in mandatory').not().isEmpty(),
  check('description', 'The description is mandatory').not().isEmpty(),
  check('price', 'The price is mandatory').not().isEmpty(),
  check('price', 'The price must be a number').not().isString(),
  check('quantity', 'The quantity is mandatory').not().isEmpty(),
  check('quantity', 'The quantity must be a number').not().isString(),
  validateFields,
  validateExistProductByParamsId,
  protectAccountOwner
], updateProduct);

router.delete('/:id', validateExistProductByParamsId, protectAccountOwner, deleteProduct)

module.exports = {
  productRouter: router
}