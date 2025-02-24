// Configura las rutas de la API
const express = require('express')
const router = express.Router()

// Controladores usuarios
const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
  getUsuarioPhoto,
  updateUsuarioFoto,
  updateUsuario,
} = require('../controllers/usuario.js')

const { userInfo } = require('../controllers/userInfo.js')

// Controladores autenticación
const {
  login,
  sendRecover,
  verifyToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
} = require('../controllers/login.js')

// Controladores transaccion
const {
  getTransacciones,
  getCompras,
  getVentas,
} = require('../controllers/transaccion.js')

// Controladores tienda
const { getTiendas } = require('../controllers/tienda.js')

// Controlador de busqueda
const { search } = require('../controllers/search.js')

const {
  getProducto,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
} = require('../controllers/producto.js')
// Controladores de calificaciones de productos
const {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
} = require('../controllers/ratingProduct.js')

const { getRatingSeller } = require('../controllers/vistaVendedor.js')

// Rutas usuarios
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.get('/getUsuarioPhoto/:id', getUsuarioPhoto)
router.post('/usuarios', registerUsuario)
router.put('/updateUsuarioFoto/:idUsuario', updateUsuarioFoto)
router.put('/updateUsuario/:id', updateUsuario)

// Rutas de autenticación
router.post('/login', login)
router.get('/userInfo', userInfo)
router.post('/sendRecover', sendRecover)
router.get('/verifyToken/:token', verifyToken)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

// Rutas de transacciones
router.get('/transacciones', getTransacciones)
router.get('/compras/:id', getCompras)
router.get('/ventas/:id', getVentas)

// Rutas de tienda
router.get('/tiendas', getTiendas)

// Rutas de productos
router.get('/search', search)
router.get('/productos', getProducto)
router.post('/addProduct', publishProducto)
router.get('/models/:tipo/:id', getModels)
router.get('/brands', getBrands)
router.get('/productos/:id', getProductById)
// Mercado Pago
router.post('/createPreference', createPreference)

//Rutas calificaciones productos
router.get('/ratingProduct/:id', ratingProduct)
router.get('/averageProductRatings/:id', averageProductRatings)
router.post('/addRatingProduct', addRatingProduct)
router.post('/checkUserPurchase/', checkUserPurchase)

//Rutas de vista vendedor
router.get('/ratingSeller/:id', getRatingSeller)

// Ruta de prueba webhook
router.post('/webhook', (req, res) => {
  console.log('notificacion Mercado Libre:', req.body)
  res.status(200).send('OK')
})

module.exports = router
