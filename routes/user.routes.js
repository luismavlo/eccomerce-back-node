const { Router } = require("express");
const { check } = require("express-validator");
const { createUser, login, getMyProducts, getMyOrders, updateUser, deleteUser, getDetailOrder } = require("../controllers/user.controller");
const { protectToken, existUserWithEmail, accessUserWithEmail, validPassword, existUserByIdParams, protectAccountOwner, validExistOrder } = require("../middlewares/users.middlewares");
const { validateFields } = require("../middlewares/validate-fields");


const router = Router();

//:::::::::: ROUTES :::::::::://
//:::::::::: PUBLIC :::::::::://

router.post('/', [
  check('username', 'The username is mandatory').not().isEmpty(),
  check('email', 'The email must have a correct format').isEmail(),
  check('password', 'The password is mandatory and must have a minium of 8 characters').isLength({ min: 8 }),
  validateFields,
  existUserWithEmail
], createUser);

router.post('/login', [
  check('email', 'The email must have a correct format').isEmail(),
  check('password', 'The password is mandatory and must have a minium of 8 characters').isLength({ min: 8 }),
  validateFields,
  accessUserWithEmail,
  validPassword
], login);

router.use(protectToken)

//::::::::::: PROTECTED :::::::::///

router.get('/me', getMyProducts);

router.get('/orders', getMyOrders);

router.patch('/:id', [
  check('username', 'The username is mandatory').not().isEmpty(),
  check('email', 'The email must have a correct format').isEmail(),
  validateFields,
  existUserByIdParams,
  protectAccountOwner
], updateUser)

router.delete('/:id', existUserByIdParams, deleteUser);

router.get('/orders/:id', validExistOrder, getDetailOrder)

module.exports = {
  userRouter: router
}