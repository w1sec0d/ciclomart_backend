const db = require('../database/connection')

//Obtiene todas las calificaciones de un vendedor
const getRatingSeller = async (request, response) => {
  let id = parseInt(request.params.id)

  if (isNaN(id)) {
    return response.status(400).json({
      success: false,
      message: 'ID vendedor invalido',
    })
  }

  db.query(
    'SELECT * FROM vista_calificaciones_productos_vendedor WHERE idUsuario = ?',
    [id],
    (error, results) => {
      if (error) {
        console.error('Error realizando la consulta', error)
        return response.status(500).json({
          success: false,
          message: 'Server error, intentelo más tarde',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Calificaciones obtenidas con exito',
        results,
      })
    }
  )
}

module.exports = {
  getRatingSeller,
}
