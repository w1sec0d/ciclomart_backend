const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')

const userInfo = async (request, response) => {
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
              'Error en el servidor, no se puede obtener la información del usuario',
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

module.exports = {
  userInfo,
}
