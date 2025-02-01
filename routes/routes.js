// Configura las rutas de la API
const express = require('express')
const router = express.Router()

// Controladores usuarios
const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
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
  getComprasById,
  getVentasById,
} = require('../controllers/transaccion.js')

// Controladores tienda
const { getTiendas } = require('../controllers/tienda.js')

// Controlador de busqueda
const { search } = require('../controllers/search.js')

// Controladores de calificaciones de productos 
const { ratingProduct } = require('../controllers/ratingProduct.js')

// Rutas usuarios
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
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
router.get('/getTransacciones', getTransacciones)
router.get('/getComprasById/:id', getComprasById)
router.get('/getVentasById/:id', getVentasById)

// Rutas de tienda
router.get('/getTiendas', getTiendas)

// Rutas de búsqueda
router.get('/search', search)

//Rutas calificaciones productos
router.get('/ratingProduct/:id', ratingProduct)

module.exports = router
