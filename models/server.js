const express = require('express');
const cors = require('cors');
const { db } = require('../database/config');
const initModel = require('./initModel');
const { cartRouter } = require('../routes/cart.routes');
const { productRouter } = require('../routes/products.routes');
const { userRouter } = require('../routes/user.routes');
const { globalErrorHandler } = require('../controllers/error.controller');
const { categoryRouter } = require('../routes/category.routes');
const { viewRouter } = require('../routes/view.routes');
const path = require('path');
const { searchRouter } = require('../routes/search.routes');

class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    //Path Routes
    this.paths = {
      view: '/',
      users: '/api/v1/users',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      category: '/api/v1/category',
      search: '/api/v1/search'
    }

    //Connect to db
    this.database();

    //Middlewares
    this.middlewares();

    this.pug();
    //Routes
    this.routes();
  }

  middlewares() {
    //cors
    this.app.use(cors());
    //parseo del body
    this.app.use(express.json());

    this.app.use(express.static('public'));
    //ayuda a trabajar con las query de la url
    this.app.use(express.urlencoded({ extended: true }));
  }

  pug() {
    this.app.set('view engine', 'pug');
    this.app.set('views', path.join(__dirname, '..', 'views'));
  }

  routes() {
    this.app.use(this.paths.view, viewRouter);
    this.app.use(this.paths.users, userRouter);
    this.app.use(this.paths.products, productRouter);
    this.app.use(this.paths.cart, cartRouter);
    this.app.use(this.paths.category, categoryRouter);
    this.app.use(this.paths.search, searchRouter)

    //GLOBAL ERROR
    this.app.use('*', globalErrorHandler);
  }

  database() {
    db.authenticate()
      .then(() => console.log('Database authenticated'))
      .catch(err => console.log(err));

    //relations
    initModel()

    db.sync()
      .then(() => console.log('Database synced'))
      .catch(err => console.log(err));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('Servidor corriento en puerto', this.port)
    })
  }

}

module.exports = Server