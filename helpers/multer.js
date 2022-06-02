//importar multer
const multer = require('multer');

//multer.diskStorage(); //almacena la imagen en el servidor no es la mejor opción

const storage = multer.memoryStorage(); //amacena la imagen en memoria y no en el servidor

//usamos multer
const upload = multer({ storage });

module.exports = { upload }