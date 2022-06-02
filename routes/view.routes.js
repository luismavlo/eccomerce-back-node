const { Router } = require("express");
const { renderIndex } = require("../controllers/view.controller");

const router = Router();


router.get('/', renderIndex);


module.exports = { viewRouter: router }
