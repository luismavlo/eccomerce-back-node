const { catchAsync } = require("../helpers/catchAsync");
const Product = require("../models/product.model");
const ProductImg = require("../models/productImg.model");
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { v4: uuidv4 } = require('uuid');

const { storage } = require('../helpers/firebase')

const createProduct = catchAsync(async (req, res = response, next) => {

  let { title, description, price, quantity, categoryId } = req.body;

  title = title.toLowerCase();
  price = +price;
  quantity = +quantity;
  categoryId = +categoryId;



  const userId = req.sessionUser.id;

  const newProduct = await Product.create({ title, description, quantity, price, categoryId, userId })

  const productImgsPromise = req.files.map(async (file) => {
    //crear referencia de la imagen
    const imgRef = ref(storage, `products/${newProduct.id}-${uuidv4()}-${file.originalname}`);

    //use uploadBytes
    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    //Create a new postImg instance( PostImg.create )
    return await ProductImg.create({
      productId: newProduct.id,
      imgUrl: imgUploaded.metadata.fullPath
    });
  });

  //resolve the pending promise
  await Promise.all(productImgsPromise)


  res.json({
    status: 'success',
    message: 'succesfully created product',
    newProduct
  });
});


const getAllProduct = catchAsync(async (req, res = response, next) => {

  const { page = 0, size = 10 } = req.query;

  let options = {
    limit: +size,
    offset: (+page) * (+size),
    where: {
      status: true
    },
    include: [
      { model: ProductImg }
    ]
  }

  const { count, rows } = await Product.findAndCountAll(options)

  //Get all products image
  const productsPromises = rows.map(async (row) => {
    const productImgsPromises = row.productImgs.map(async (productImg) => {
      //Get Img From Firebase
      const imgRef = ref(storage, productImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      //update productImgUrl
      productImg.imgUrl = url;
      return productImg
    });
    //Resolve pending promise
    const productsImgsResolved = await Promise.all(productImgsPromises);
    row.productImgs = productsImgsResolved;

    return row
  });

  const productsResolved = await Promise.all(productsPromises)

  res.json({
    status: 'success',
    total: count,
    products: productsResolved
  });
});


const getProductById = catchAsync(async (req, res = response, next) => {

  const { product } = req;

  const productImgsPromises = product.productImgs.map(async (productImg) => {

    const imgRef = ref(storage, productImg.imgUrl);
    const url = await getDownloadURL(imgRef)

    productImg.imgUrl = url;
    return productImg
  })

  const productImgsResolved = await Promise.all(productImgsPromises);
  product.productImgs = productImgsResolved;

  res.json({
    status: 'success',
    product
  });
});


const updateProduct = catchAsync(async (req, res = response, next) => {

  const { product } = req;

  let { title, description, price, quantity } = req.body;

  title = title.toLowerCase();

  await product.update({ title, description, price, quantity })

  res.json({
    status: 'success',
    message: 'successfully update product'
  });
});


const deleteProduct = catchAsync(async (req, res = response, next) => {

  const { product } = req;

  await product.update({ status: false })

  res.json({
    status: 'success'
  });
});

module.exports = {
  createProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct
}
