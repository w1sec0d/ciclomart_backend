const bcrypt = require('bcrypt')
// controller for user
const db = require('../database/connection')

const getUsuarios = (request, response) => {
  db.query('SELECT * FROM usuario', (error, results) => {
    if (error) {
      console.error('Error executing query', error)
      response.status(500).send('Internal server error')
      return
    }
    response.json(results)
  })
}

const getUsuarioById = (request, response) => {
  const id = parseInt(request.params.id)

  if (isNaN(id)) {
    response.status(400).send('Bad id parameter')
    return
  }

  db.query('SELECT * FROM usuario WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error executing query', error)
      response.status(500).send('Internal server error')
      return
    }
    response.json(results)
  })
}

const registerUsuario = async (request, response) => {
  const { nombre, apellido, email, password } = request.body

  if (!nombre || !apellido || !email || !password) {
    response.status(400).send('Missing fields')
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  db.query(
    'INSERT INTO usuario (nombre, apellido, correo, password, fechaRegistro) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, email, passwordHash, new Date()],
    (error, results) => {
      if (error) {
        console.error('Error executing query', error)
        response.status(500).send('Internal server error')
        return
      }
      response.status(201).send('User added successfully')
    }
  )
}

const updateUsuarioFoto = (request, response) => {
  const photoUrl = request.body.photoUrl
  const idUser = parseInt(request.params.idUsuario)
  db.query(
    'UPDATE usuario SET foto = ? WHERE idUsuario = ?',
    [photoUrl, idUser],
    (error, results) => {
      if (error) {
        console.error('Error executing query', error)
        response.status(500).send('Internal server error')
        return
      }
      response.status(200).send('User photo updated successfully')
    }
  )
}

const updateUsuario = (request, response) => {
  const id = parseInt(request.params.id)
  const fields = request.body

  if (isNaN(id)) {
    response.status(400).send('Bad id parameter')
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
    response.status(400).send('No valid fields to update')
    return
  }

  // Agregar el id al final del arreglo de valores
  values.push(id)

  // Construir la consulta SQL dinámica
  const query = `UPDATE usuario SET ${updates.join(', ')} WHERE idUsuario = ?`

  // Ejecutar la consulta SQL
  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error executing query', error)
      response.status(500).send('Internal server error')
      return
    }
    response.status(200).send('User updated successfully')
  })
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  registerUsuario,
  updateUsuarioFoto,
  updateUsuario,
}
