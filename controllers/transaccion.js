const db = require('../database/connection.js')

// Obtiene todas las transacciones
const getTransacciones = (request, response) => {
  try {
    db.query('SELECT * FROM transaccion', (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message:
            'Internal server error, no se pueden obtener las transacciones',
          error: error.message,
        })
      }
      return response.status(200).json({
        success: true,
        message: 'Transacciones obtenidas exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Obtiene las compras de un usuario dado
const getCompras = (request, response) => {
  try {
    const idComprador = request.params.id

    if (isNaN(idComprador)) {
      return response.status(400).json({
        success: false,
        message: 'Id de comprador inválida',
      })
    }

    db.query(
      'SELECT * FROM vista_compras_usuario WHERE idUsuario = ?',
      [idComprador],
      (error, results) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: 'Error, no se pueden obtener las tiendas',
            error: error.message,
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Compras obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Obtiene las ventas de un usuario dado
const getVentas = (request, response) => {
  try {
    const idVendedor = request.params.id
    if (isNaN(idVendedor)) {
      return response
        .status(400)
        .json({ message: 'Id de vendedor inválida', success: false })
    }
    db.query(
      'SELECT * FROM vista_ventas_usuario WHERE idVendedor = ? ',
      [idVendedor],
      (error, results) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: 'Server error, no se encontraron las ventas',
            error: error.message,
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Ventas obtenidas exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Server error', error)
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

module.exports = { getTransacciones, getCompras, getVentas }
