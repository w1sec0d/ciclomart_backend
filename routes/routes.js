const express = require('express')
const router = express.Router()
const db = require('../database/connection.js')
const { getUsuarios } = require('../controllers/usuario.js')

//rutas para la tabla persona.

//Ver las personas
router.get('/usuarios', getUsuarios)

module.exports = router
