const bcrypt = require('bcrypt')
const db = require('../database/connection')

// Obtiene todos los usuarios
const getUsuarios = (request, response) => {
  db.query('SELECT * FROM usuario', (error, results) => {
    if (error) {
      console.error('Error ejecutando la consulta', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
    }

    response.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: results,
    })
  })
}

// Obtiene un usuario por su ID
const getUsuarioById = (request, response) => {
  const id = parseInt(request.params.id)

  if (isNaN(id)) {
    return response.status(400).send('Parámetro de ID inválido')
  }

  db.query('SELECT * FROM usuario WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error ejecutando la consulta', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
    }
    response.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: results,
    })
  })
}

// Registra un nuevo usuario
const registerUsuario = async (request, response) => {
  const { nombre, apellido, email, password } = request.body

  if (!nombre || !apellido || !email || !password) {
    response.status(400).send('Datos Faltantes')
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  db.query(
    'INSERT INTO usuario (nombre, apellido, correo, password, fechaRegistro) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, email, passwordHash, new Date()],
    (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error en el servidor, intentalo más tarde',
          error: error.message,
        })
      }
      response.status(201).json({
        success: true,
        message: 'Usuario añadido satisfactoriamente',
      })
    }
  )
}

// Actualiza la foto de un usuario
const updateUsuarioFoto = (request, response) => {
  const photoUrl = request.body.photoUrl
  const idUser = parseInt(request.params.idUsuario)
  db.query(
    'UPDATE usuario SET foto = ? WHERE idUsuario = ?',
    [photoUrl, idUser],
    (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error.message,
        })
      }
      response.status(200).json({
        success: true,
        message: 'Foto del usuario actualizada correctamente',
      })
    }
  )
}

// Actualiza los datos de un usuario
const updateUsuario = (request, response) => {
  const id = parseInt(request.params.id)
  const fields = request.body

  if (isNaN(id)) {
    response.status(400).send('Parámetro de ID inválido')
    return
  }

  const validFields = [
    'nombre',
    'apellido',
    'edad',
    'rol',
    'correo',
    'direccion',
    'telefono',
    'username',
    'password',
    'foto',
  ]
  const updates = []
  const values = []

  // Construir la lista de campos a actualizar y sus valores correspondientes
  for (const field of validFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = ?`)
      values.push(fields[field])
    }
  }

  if (updates.length === 0) {
    response.status(400).send('No hay campos válidos para actualizar')
    return
  }

  values.push(id)

  // Construir la consulta SQL dinámica
  const query = `UPDATE usuario SET ${updates.join(', ')} WHERE idUsuario = ?`

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error ejecutando la consulta', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
    }
    response.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
    })
  })
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  registerUsuario,
  updateUsuarioFoto,
  updateUsuario,
}
