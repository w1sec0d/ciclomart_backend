// Configures the API routes
const express = require('express')
const router = express.Router()

// Users controllers
const {
  getUser,
  registerUsuario,
  getUsuarioPhoto,
  updateUsuarioFoto,
  updateUsuarioDireccion,
} = require('../controllers/usuario.js')

// Authentication controllers
const {
  login,
  sendRecover,
  verifyToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
} = require('../controllers/login.js')

// Transactions controllers
const {
  getTransacciones,
  getCompras,
  getVentas,
} = require('../controllers/transaccion.js')

// Store controllers
const { getTiendas } = require('../controllers/tienda.js')

// Search controller
const { search } = require('../controllers/search.js')

const {
  getProducto,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
  uploadImage,
  getImages,
  getBicicletas,
  getComponentes,
  getProductosOferta,
  addBrand
} = require('../controllers/producto.js')

const { createExposurePreference } = require('../controllers/exposicion.js')

// Product ratings controllers
const {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
} = require('../controllers/ratingProduct.js')

const { getRatingSeller } = require('../controllers/vistaVendedor.js')
const webhookMercadoLibre = require('../controllers/webhookMercadoLibre.js')

const {
  getShoppingCart,
  addToShoppingCart,
  removeFromShoppingCart,
} = require('../controllers/shoppingCart.js')

const {
  getPurchasesById,
  confirmShipment,
  cancelPurchase,
} = require('../controllers/purchases.js')

const {
  getQuestions,
  addQuestion,
  answerQuestions
} = require('../controllers/questions.js')

const { oauthCallback } = require('../controllers/oauth.js')

// Users routes
router.get('/getUsuarioPhoto/:id', getUsuarioPhoto)
router.post('/usuarios', registerUsuario)
router.put('/updateUsuarioFoto/:idUsuario', updateUsuarioFoto)
router.put('/updateUsuarioDireccion/:idUsuario', updateUsuarioDireccion)

// Authentication routes
router.post('/login', login)
router.get('/userInfo', getUser)
router.post('/sendRecover', sendRecover)
router.get('/verifyToken/:token', verifyToken)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

// Transactions routes
router.get('/transacciones', getTransacciones)
router.get('/compras/:id', getCompras)
router.get('/ventas/:id', getVentas)

// Store routes
router.get('/tiendas', getTiendas)

// Products routes
router.get('/search', search)
router.get('/productos', getProducto)
router.get('/bicicletas', getBicicletas)
router.get('/componentes', getComponentes)
router.get('/ofertas', getProductosOferta)
router.post('/addProduct', publishProducto)
router.get('/models/:tipo/:id', getModels)
router.get('/brands', getBrands)
router.get('/productos/:id', getProductById)
router.post('/uploadImage', uploadImage)
router.get('/images/:id', getImages)
router.post('/addBrand', addBrand)

// Mercado Pago routes
router.post('/createPreference', createPreference)
router.post('/createExposurePreference', createExposurePreference)

// Products ratings routes
router.get('/ratingProduct/:id', ratingProduct)
router.get('/averageProductRatings/:id', averageProductRatings)
router.post('/addRatingProduct', addRatingProduct)
router.post('/checkUserPurchase/', checkUserPurchase)

// Seller view routes
router.get('/ratingSeller/:id', getRatingSeller)

// Webhook routes
router.post('/webhookMercadoLibre', webhookMercadoLibre)

// Shopping cart routes
router.get('/shoppingCart/:id', getShoppingCart)
router.post('/addToShoppingCart', addToShoppingCart)
router.delete(
  '/removeFromShoppingCart/:idUsuario/:idProducto',
  removeFromShoppingCart
)

// Purchases routes
router.get('/purchases/:idComprador', getPurchasesById)
router.post('/confirmShipment/:idCarrito', confirmShipment)
router.post('/cancelPurchase/:idCarrito', cancelPurchase)

// Questions routes
router.get('/questions/:idProducto', getQuestions)
router.post('/addQuestion', addQuestion)
router.post('/answerQuestion', answerQuestions)

// OAuth Authentication routes
router.get('/oauth/callback', oauthCallback)

module.exports = router
