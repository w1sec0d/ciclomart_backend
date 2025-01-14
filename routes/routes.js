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
} = require('../controllers/login.js')

const { getTiendas } = require('../controllers/tienda.js')

const { userInfo } = require('../controllers/userInfo.js')

//rutas para la tabla persona.

//Ver las personas
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.post('/usuarios', registerUsuario)

//autenticacion
router.post('/login', login)
router.get('/userInfo', userInfo)
router.post('/sendEmail', sendEmail)
router.get('/evaluateToken/:token', evaluateToken)
router.post('/updatePassword', updatePassword)

//rutas para la tabla tienda
router.get('/getTiendas', getTiendas)

module.exports = router
