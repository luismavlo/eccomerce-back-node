const { Router } = require("express");
const { check } = require("express-validator");
const { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory } = require("../controllers/category.controller");
const { existCategoryByIdParams, validExistNameCategory } = require("../middlewares/category.middleware");
const { protectToken, validIsAdmin } = require("../middlewares/users.middlewares");


const { validateFields } = require("../middlewares/validate-fields");

const router = Router();


//:::::::::: ROUTES :::::::::://
//:::::::::: PUBLIC :::::::::://

router.get('/', getCategories);

router.get('/:id', existCategoryByIdParams, getCategoryById);

//::::::::::: PROTECTED :::::::::///
router.use(protectToken)
router.use(validIsAdmin)

router.post('/', [
  check('name', 'the name is mandatory').not().isEmpty(),
  validateFields,
  validExistNameCategory,
], createCategory);

router.patch('/:id', [
  check('name', 'The name is mandatory').not().isEmpty(),
  validateFields,
  existCategoryByIdParams,
], updateCategory);

router.delete('/:id', existCategoryByIdParams, deleteCategory);

module.exports = {
  categoryRouter: router
}