const express = require('express')
const router = express.Router()
const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
} = require('../controllers/usuario.js')

//rutas para la tabla persona.

//Ver las personas
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.post('/usuarios', registerUsuario)

module.exports = router
