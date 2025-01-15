const express = require('express')
const router = express.Router()

const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
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

//autenticacion
router.post('/login', login)
router.get('/userInfo', userInfo)
router.post('/sendEmail', sendEmail)
router.get('/evaluateToken/:token', evaluateToken)
router.post('/updatePassword', updatePassword)
router.post('/sendRegisterCode', sendRegisterCode)
router.post('/validateCode', validateCode)

module.exports = router
