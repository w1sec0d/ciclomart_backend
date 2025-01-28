const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')

const userInfo = async (req, res) => {
  // Obtiene el encabezado de la autorización de la solicitud
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se proporcionó token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    db.query(
      'SELECT * FROM usuario WHERE idUsuario = ?',
      [decoded.id],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message:
              'Error en el servidor, no se puede obtener la información del usuario',
          })
        }
        if (result.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        const user = result[0]
        res.status(200).json({ user })
      }
    )
  } catch (error) {
    res.status(401).json({
      message: 'Token inválido',
    })
  }
}

module.exports = {
  userInfo,
}
