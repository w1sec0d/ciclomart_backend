// Handles user related operations
const executeQuery = require('../utils/executeQuery')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')
const { verifyToken } = require('./login')

// Registers a new user
const registerUsuario = async (request, response) => {
  try {
    const { nombre, apellido, email, password, telefono } = request.body

    if (!nombre || !apellido || !email || !password || !telefono) {
      return response.status(400).json({
        success: false,
        message: 'Missing required fields',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const insertUsuarioQuery = 'INSERT INTO usuario (nombre, apellido, correo, password,telefono, fechaRegistro) VALUES (?, ?, ?, ?, ?, ?)'
    const usuarioResults = await executeQuery(insertUsuarioQuery, [nombre, apellido, email, passwordHash, telefono, new Date()])

    const idUsuario = usuarioResults.insertId

    return response.status(201).json({
      success: true,
      message: 'User added successfully',
      data: {
        idUsuario,
      },
    })

  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Gets user's information received from the token
const getUser = async (request, response) => {
  // Obtiene el encabezado de la autorización de la solicitud
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({
      success: false,
      message: 'No se proporcionó token',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    db.query(
      'SELECT * FROM usuario WHERE idUsuario = ?',
      [decoded.id],
      (err, result) => {
        if (err) {
          return response.status(500).json({
            success: false,
            message:
              'Server error, no se puede obtener la información del usuario',
            error: err.message,
          })
        }
        if (result.length === 0) {
          return response.status(404).json({
            success: false,
            message: 'Usuario no encontrado',
          })
        }
        const user = result[0]
        response.status(200).json({
          success: true,
          message: 'Información del usuario obtenida exitosamente',
          user,
        })
      }
    )
  } catch (error) {
    response.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message,
    })
  }
}

// Gets a user's photo by their ID
const getUsuarioPhoto = async (request, response) => {
  try {
    const idUser = parseInt(request.params.id)

    if (isNaN(idUser)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid user ID',
      })
    }

    const query = 'SELECT url FROM imagen WHERE idUsuario = ?'
    const results = await executeQuery(query, [idUser])

    if (results.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Photo not found for the specified user',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'User photo retrieved successfully',
      photoUrl: results[0].url,
    })
  } catch (error) {
    console.error('Server Error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Updates a user's photo
const updateUsuarioFoto = async (request, response) => {
  try {
    const photoUrl = request.body.photoUrl
    const idUser = parseInt(request.params.idUsuario)

    if (!photoUrl) {
      return response.status(400).json({
        success: false,
        message: 'No se proporcionó una URL de la foto',
      })
    }

    if (isNaN(idUser)) {
      return response.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
      })
    }

    const query = `
      INSERT INTO imagen (idUsuario, url) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE url = VALUES(url)
    `
    await executeQuery(query, [idUser, photoUrl])

    return response.status(200).json({
      success: true,
      message: 'Foto del usuario actualizada correctamente',
    })
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Updates a user's address
const updateUsuarioDireccion = async (req, res) => {
  const {
    direccionNombre,
    direccionNumero,
    codigoPostal,
    direccionCiudad,
    direccionApartamento,
    direccionPiso,
  } = req.body
  const idUsuario = req.params.idUsuario

  try {
    const query = `
      UPDATE usuario
      SET direccionNombre = ?, direccionNumero = ?, codigoPostal = ?, direccionCiudad = ?, direccionApartamento = ?, direccionPiso = ?
      WHERE idUsuario = ?
    `
    const values = [
      direccionNombre,
      direccionNumero,
      codigoPostal,
      direccionCiudad,
      direccionApartamento,
      direccionPiso,
      idUsuario,
    ]

    const results = await executeQuery(query, values)

    res.status(200).json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: {
        direccionNombre,
        direccionNumero,
        codigoPostal,
        direccionCiudad,
        direccionApartamento,
        direccionPiso,
      },
      results,
    })
  } catch (error) {
    console.error('Error actualizando dirección:', error)
    res.status(500).json({
      success: false,
      message: 'Error actualizando dirección',
      error: error.message,
    })
  }
}

module.exports = {
  getUser,
  getUsuarioPhoto,
  registerUsuario,
  updateUsuarioFoto,
  updateUsuarioDireccion,
}
