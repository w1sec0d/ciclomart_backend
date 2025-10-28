// Configures the API routes
const express = require('express')
const router = express.Router()

// Users controllers
const {
  getUser,
  registerUser,
  getUserPhoto,
  updateUserPhoto,
  updateUserAddress,
} = require('../controllers/user.js')

// Authentication controllers
const {
  login,
  sendRecover,
  updatePassword,
  sendRegisterCode,
  validateCode,
} = require('../controllers/auth.js')

// Transactions controllers
const {
  getTransactions,
  getPurchasesByBuyerId,
  getSalesBySellerId,
} = require('../controllers/transaction.js')

// Store controllers
const { getStores } = require('../controllers/store.js')

// Search controller
const { searchProducts } = require('../controllers/search.js')

const {
  getProduct,
  getProductById,
  createPreference,
  publishProduct,
  getModels,
  getBrands,
  uploadImage,
  getImages,
  getBicycles,
  getComponents,
  getProductsOnOffer,
  addBrand
} = require('../controllers/product.js')

const { createExposurePreference } = require('../controllers/exposure.js')

// Product ratings controllers
const {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
} = require('../controllers/ratingProduct.js')

const { getRatingSeller } = require('../controllers/seller.js')
const webhookMercadoLibre = require('../controllers/webhookMercadoLibre.js')

const {
  getShoppingCartByBuyerId,
  addToShoppingCartByBuyerId,
  removeFromShoppingCartByBuyerId,
} = require('../controllers/shoppingCart.js')

const {
  getPurchasesById,
  confirmShipment,
  cancelPurchase,
} = require('../controllers/purchase.js')

const {
  getQuestions,
  addQuestion,
  answerQuestions
} = require('../controllers/question.js')

const { oauthCallback } = require('../controllers/oauth.js')
const { preferenceTest } = require('../debug/preferenceTest.js')
const { debugPreference } = require('../debug/debugPreference.js')
const { debugPayment } = require('../debug/debugPayment.js')

// Users routes
router.get('/getUser', getUser)
router.get('/getUserPhoto/:id', getUserPhoto)
router.post('/users', registerUser)
router.put('/updateUserPhoto/:idUser', updateUserPhoto)
router.put('/updateUserAddress/:idUser', updateUserAddress)

// Authentication routes
router.post('/login', login)
router.post('/sendRecover', sendRecover)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

// Transactions routes
router.get('/transactions', getTransactions)
router.get('/purchases/:buyerId', getPurchasesByBuyerId)
router.get('/sales/:sellerId', getSalesBySellerId)

// Store routes
router.get('/stores', getStores)

// Products routes
router.get('/search', searchProducts)
router.get('/products', getProduct)
router.get('/bicycles', getBicycles)
router.get('/components', getComponents)
router.get('/offers', getProductsOnOffer)
router.post('/addProduct', publishProduct)
router.get('/models/:tipo/:id', getModels)
router.get('/brands', getBrands)
router.get('/products/:id', getProductById)
router.post('/uploadImage', uploadImage)
router.get('/images/:id', getImages)
router.post('/addBrand', addBrand)

// Mercado Pago routes
router.post('/createPreference', createPreference)
router.post('/createExposurePreference', createExposurePreference)

// Products ratings routes
router.get('/ratingProduct/:productId', ratingProduct)
router.get('/averageProductRatings/:productId', averageProductRatings)
router.post('/addRatingProduct', addRatingProduct)
router.post('/checkUserPurchase/', checkUserPurchase)

// Seller view routes
router.get('/ratingSeller/:sellerId', getRatingSeller)

// Webhook routes
router.post('/webhookMercadoLibre', webhookMercadoLibre)

// Shopping cart routes
router.get('/shoppingCart/:buyerId', getShoppingCartByBuyerId)
router.post('/addToShoppingCart', addToShoppingCartByBuyerId)
router.delete(
  '/removeFromShoppingCart/:buyerId/:productId',
  removeFromShoppingCartByBuyerId
)

// Purchases routes
router.get('/purchases/:buyerId', getPurchasesById)
router.post('/confirmShipment/:idCarrito', confirmShipment)
router.post('/cancelPurchase/:idCarrito', cancelPurchase)

// Questions routes
router.get('/questions/:idProducto', getQuestions)
router.post('/addQuestion', addQuestion)
router.post('/answerQuestion', answerQuestions)

// OAuth Authentication routes
router.get('/oauth/callback', oauthCallback)

// Preference test
router.get('/preferenceTest', preferenceTest)

// Debug routes
router.get('/debug/preference', debugPreference)
router.get('/debug/payment', debugPayment)

module.exports = router
