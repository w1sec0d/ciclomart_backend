const express = require('express')
const router = express.Router()

const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
  updateUsuarioFoto,
  updateUsuario,
} = require('../controllers/usuario.js')

const {
  login,
  sendEmail,
  evaluateToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
  verifyEmail,
} = require('../controllers/login.js')

/*Stores*/
const { getTiendas } = require('../controllers/tienda.js')

/*Transactions*/
const {
  getTransacciones,
  getComprasById,
  getVentasById,
} = require('../controllers/transaccion.js')

const { userInfo } = require('../controllers/userInfo.js')

//rutas para la tabla persona.

const { search } = require('../controllers/search.js')
//rutas para la busqueda de productos

//Ver las personas
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.post('/usuarios', registerUsuario)
//Buscar productos
router.get('/search', search)

//Updates userr
router.put('/updateUsuarioFoto/:idUsuario', updateUsuarioFoto)
router.put('/updateUsuario/:id', updateUsuario)

//autenticacion
router.post('/login', login)
router.get('/userInfo', userInfo)
router.post('/sendEmail', sendEmail)
router.get('/evaluateToken/:token', evaluateToken)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

//Routes for table 'tienda'
router.get('/getTiendas', getTiendas)

//Routes for table 'transaccion'
router.get('/getTransacciones', getTransacciones)
router.get('/getComprasById/:id', getComprasById)
router.get('/getVentasById/:id', getVentasById)

module.exports = router
