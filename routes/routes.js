const express = require('express')
const router = express.Router()
const {
  getUsuarios,
  registerUsuario,
  getUsuarioById,
} = require('../controllers/usuario.js')
//rutas para la tabla persona.

const { search } = require('../controllers/search.js')
//rutas para la busqueda de productos

//Ver las personas
router.get('/usuarios', getUsuarios)
router.get('/usuarios/:id', getUsuarioById)
router.post('/usuarios', registerUsuario)
//Buscar productos
router.get('/search', search)

module.exports = router
