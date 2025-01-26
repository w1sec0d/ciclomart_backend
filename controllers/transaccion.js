const db = require('../database/connection.js')

// Obtiene todas las transacciones
const getTransacciones = (request, response) => {
  db.query('SELECT * FROM transaccion', (error, results) => {
    if (error) {
      return response.status(500).json({
        message:
          'Error interno del servidor, no se pueden obtener las transacciones',
        error: error,
      })
    }
    response.status(200).json(results)
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
          message: 'Error, no se pueden obtener las tiendas',
          error: error,
        })
      }
      response.status(200).json(results)
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
          message: 'Error en el servidor, no se encontraron las ventas',
          error: error,
        })
      }
      response.status(200).json(results)
    }
  )
}

module.exports = { getTransacciones, getComprasById, getVentasById }
