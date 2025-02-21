const db = require('../database/connection')

// Obtiene el carrito de un usuario
const getShoppingCart = (request, response) => {
  const { id } = request.params
  const idUsuario = parseInt(id)

  if (isNaN(idUsuario)) {
    return response.status(400).json({
      success: false,
      message: 'ID usuario inválido',
    })
  }

  try{
    db.query(
        'SELECT * FROM vista_productos_carrito_usuario WHERE idUsuario = ?',
        [idUsuario],
        (error, results) => {
          if (error) {
            console.error('Error realizando la consulta ', error)
            return response.status(500).json({
              success: false,
              message: 'Error obteniendo carrito',
              error: error.message,
            })
          }
          return response.status(200).json({
            success: true,
            message: 'Carrito obtenido con exito',
            results,
          })
        }
      )
  } catch{(error) => {
    return response.status(500).json({
      success: false,
      message: 'Error obteniendo carrito',
      error: error.message,
    })
  }}
}

module.exports = { getShoppingCart }