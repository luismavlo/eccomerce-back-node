const { Router } = require("express");
const { check } = require("express-validator");
const { addProductToCart, updateCart, removeProductToCart, buyProductsOnCart } = require("../controllers/cart.controller");
const { validExistCart, validExistProductOnCart, validExistProductIdByParams, validExistProductInCartForUpdate, validExistProductInCartByParams } = require("../middlewares/cart.middleware");
const { validExistProductId, validExistProductsInStock, validExistProductsInStockForUpdate } = require("../middlewares/product.middleware");
const { protectToken } = require("../middlewares/users.middlewares");
const { validateFields } = require("../middlewares/validate-fields");


const router = Router();

router.use(protectToken);

router.post('/add-product', [
  check('productId', 'The productId is required').not().isEmpty(),
  check('productId', 'The productId must be a number').not().isString(),
  check('quantity', 'The quantity is required').not().isEmpty(),
  check('quantity', 'The quantity must be a number').not().isString(),
  validateFields,
  validExistProductId,
  validExistProductsInStock,
  validExistCart,
  validExistProductOnCart
], addProductToCart);

router.patch('/update-cart', [
  check('productId', 'The productId is required').not().isEmpty(),
  check('productId', 'The productId must be a number').not().isString(),
  check('newQty', 'The quantity is required').not().isEmpty(),
  check('newQty', 'The productId must be a number').not().isString(),
  validateFields,
  validExistProductId,
  validExistProductsInStockForUpdate,
  validExistProductInCartForUpdate
], updateCart);

router.delete('/:productId', validExistProductIdByParams, validExistProductInCartByParams, removeProductToCart);

router.post('/purchase', buyProductsOnCart);


module.exports = {
  cartRouter: router
}