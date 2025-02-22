const db = require('../database/connection')

// Obtiene todas las calificaciones de un producto
const ratingProduct = (request, response) => {
  const { id } = request.params
  const idProducto = parseInt(id)

  if (isNaN(idProducto)) {
    return response.status(400).json({
      success: false,
      message: 'ID producto inválido',
    })
  }

  db.query(
    'SELECT * FROM vista_producto_calificacion WHERE idProducto = ?',
    [idProducto],
    (error, results) => {
      if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
          success: false,
          message: 'Error en el servidor, intentalo más tarde',
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

//Calcula el promedio de las calificaciones de un producto

const averageProductRatings = (request, response) => {
  const { id } = request.params
  const idProducto = parseInt(id)

  db.query(
    'SELECT * from vista_producto_calificacion_promedio WHERE idProducto = ?',
    [idProducto],
    (error, results) => {
      if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
          success: false,
          message: 'Error en el servidor. Intentelo más tarde',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Promedio de la calificación obtenida con éxito',
        results,
      })
    }
  )
}

// Permite revisar si un usuario compro un producto. De vuelve el id vendedor
const checkUserPurchase = (request, response) => {
  const { idComprador, idProducto } = request.body
  console.log("body", request.body)

  if (!idComprador || !idProducto) {
    return response.status(400).json({
      success: false,
      message: 'El idComprador e idProducto deben ser obligatorios',
    })
  }

  db.query(
    'SELECT * from vista_compras_usuario WHERE idUsuario = ? AND idProducto = ?',
    [idComprador, idProducto],
    (error, results) => {
      if (error) {
        console.error('Error ejecutando la validacion', error)
        return response.status(500).json({
          success: false,
          message: 'Error en el servidor. Intentelo más tarde',
          error: error.message,
        })
      }

      if (results.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron compras del usuario',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Se obtuvo con exito de validacion de compra de un usuario',
        results,
      })
    }
  )
}

const addRatingProduct = (request, response) => {
  const { idProducto, comentario, idUsuarioComprador, idUsuarioVendedor, nota, foto } = request.body
  const query = `INSERT INTO calificacion (idProducto,comentario, idUsuarioComprador, idUsuarioVendedor, nota, foto) VALUES (?, ?, ?, ?, ?, ?)`

  db.query(query, [idProducto, comentario, idUsuarioComprador, idUsuarioVendedor, nota, foto], (error, results) => {
    if (error) {
      console.error('Error ejecutando la insercion', error)
      return response.status(500).json({
        success: false,
        message: 'Error en el servidor. Intentelo más tarde',
        error: error.message,
      })
    }

    return response.status(201).json({
      success: true,
      message: 'Comentario añadido con éxito',
    })
  })
}

module.exports = {
  ratingProduct,
  averageProductRatings,
  addRatingProduct,
  checkUserPurchase,
}
