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
  const fields = request.body
  const inserts = []
  const values = []
  const bracket = []

  const validFields = [
    'idUsuarioComprador',
    'idDocumentoProducto',
    'idUsuarioVendedor',
    'foto',
    'comentario',
    'nota',
  ]

  for (const field of validFields) {
    if (fields[field] !== undefined) {
      inserts.push(`${field}`)
      values.push(fields[field])
      bracket.push('?')
    } else if (
      (field === 'idUsuarioComprador' && fields[field] === undefined) ||
      (field === 'idDocumentoProducto' && fields[field] === undefined) ||
      (field === 'idUsuarioVendedor' && fields[field] === undefined)
    ) {
      return response.status(400).json({
        success: false,
        message:
          'Los id de usuario comprador, documento producto y vendedor son obligatorios',
      })
    }
  }

  if (inserts.length === 0) {
    return response.status(400).json({
      success: false,
      message: 'No se proporcionaron datos para insertar',
    })
  }

  inserts.push('fecha')
  values.push(new Date())
  bracket.push('?')

  const query = `INSERT INTO calificacion (${inserts.join(', ')}) VALUES (${bracket.join(', ')})`

  db.query(query, values, (error, results) => {
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
