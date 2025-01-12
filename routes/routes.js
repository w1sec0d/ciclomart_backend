const express = require('express')
const router = express.Router()

const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
} = require('../controllers/usuario.js')

const {
  login
} = require('../controllers/login.js')

const {
  userInfo
} = require('../controllers/userInfo.js')

//rutas para la tabla persona.

//Ver las personas
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.post('/usuarios', registerUsuario)

//autenticacion 
router.post('/login', login)
router.get('/userInfo', userInfo)

module.exports = router
