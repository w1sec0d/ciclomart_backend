const db = require('../database/connection.js')

// Obtiene todas las transacciones
const getTransacciones = (request, response) => {
  db.query('SELECT * FROM transaccion', (error, results) => {
    if (error) {
      return response.status(500).json({
        success: false,
        message:
          'Error interno del servidor, no se pueden obtener las transacciones',
        error: error.message,
      })
    }
    response.status(200).json({
      success: true,
      message: 'Transacciones obtenidas exitosamente',
      data: results,
    })
  })
}

// Obtiene las compras de un usuario dado
const getComprasById = (request, response) => {
  const idComprador = request.params.id

  if (isNaN(idComprador)) {
    return response.status(400).json({ message: 'Id de comprador inválida' })
  }

  db.query(
    'SELECT * FROM transaccion WHERE idComprador = ? AND transaccion.estado = "exitosa"',
    [idComprador],
    (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: 'Error, no se pueden obtener las tiendas',
          error: error.message,
        })
      }
      response.status(200).json({
        success: true,
        message: 'Compras obtenidas exitosamente',
        data: results,
      })
    }
  )
}

// Obtiene las ventas de un usuario dado
const getVentasById = (request, response) => {
  const idVendedor = request.params.id
  if (isNaN(idVendedor)) {
    return response.status(400).json({ message: 'Id de vendedor inválida' })
  }
  db.query(
    'SELECT * FROM transaccion WHERE idVendedor = ? AND transaccion.estado = "exitosa"',
    [idVendedor],
    (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: 'Error en el servidor, no se encontraron las ventas',
          error: error.message,
        })
      }
      response.status(200).json({
        success: true,
        message: 'Ventas obtenidas exitosamente',
        data: results,
      })
    }
  )
}

module.exports = { getTransacciones, getComprasById, getVentasById }
