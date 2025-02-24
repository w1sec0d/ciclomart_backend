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

const addToShoppingCart = (request, response) => {
  const { idUsuario, idProducto, cantidad } = request.body

  if (isNaN(idUsuario) || isNaN(idProducto) || isNaN(cantidad)) {
    return response.status(400).json({
      success: false,
      message: 'Datos inválidos',
    })
  }

  // Obtener el ID del carrito
  db.query(
    'SELECT idCarrito FROM carrito WHERE idUsuario = ?',
    [idUsuario],
    (error, carritoResults) => {
      if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
          success: false,
          message: 'Error obteniendo ID del carrito',
          error: error.message,
        })
      }

      if (carritoResults.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'Carrito no encontrado',
        })
      }

      const idCarrito = carritoResults[0].idCarrito

      // Obtener la información del producto
      db.query(
        'SELECT * FROM producto WHERE idProducto = ?',
        [idProducto],
        (error, productoResults) => {
          if (error) {
            console.error('Error realizando la consulta ', error)
            return response.status(500).json({
              success: false,
              message: 'Error obteniendo información del producto',
              error: error.message,
            })
          }

          if (productoResults.length === 0) {
            return response.status(404).json({
              success: false,
              message: 'Producto no encontrado',
            })
          }

          const producto = productoResults[0]

          // Insertar en la tabla carritoproducto
          db.query(
            'SELECT * FROM carritoproducto WHERE idCarrito = ? AND idProducto = ?',
            [idCarrito, idProducto],
            (error, carritoproductoResults) => {
              if (error) {
                console.error('Error realizando la consulta ', error)
                return response.status(500).json({
                  success: false,
                  message: 'Error verificando producto en el carrito',
                  error: error.message,
                })
              }
    
              if (carritoproductoResults.length > 0) {
                // El producto ya existe en el carrito, actualizar la cantidad
                const nuevaCantidad = carritoproductoResults[0].cantidad + cantidad
                db.query(
                  'UPDATE carritoproducto SET cantidad = ? WHERE idCarrito = ? AND idProducto = ?',
                  [nuevaCantidad, idCarrito, idProducto],
                  (error, results) => {
                    if (error) {
                      console.error('Error realizando la consulta ', error)
                      return response.status(500).json({
                        success: false,
                        message: 'Error actualizando cantidad del producto en el carrito',
                        error: error.message,
                      })
                    }
                    return response.status(200).json({
                      success: true,
                      message: 'Cantidad del producto actualizada en el carrito',
                      results,
                    })
                  }
                )
              } else {
                // El producto no existe en el carrito, obtener la información del producto
                db.query(
                  'SELECT * FROM producto WHERE idProducto = ?',
                  [idProducto],
                  (error, productoResults) => {
                    if (error) {
                      console.error('Error realizando la consulta ', error)
                      return response.status(500).json({
                        success: false,
                        message: 'Error obteniendo información del producto',
                        error: error.message,
                      })
                    }
    
                    if (productoResults.length === 0) {
                      return response.status(404).json({
                        success: false,
                        message: 'Producto no encontrado',
                      })
                    }
    
                    const producto = productoResults[0]
    
                    // Insertar en la tabla carritoproducto
                    db.query(
                      'INSERT INTO carritoproducto (idCarrito, idProducto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                      [idCarrito, idProducto, cantidad, producto.precio],
                      (error, results) => {
                        if (error) {
                          console.error('Error realizando la consulta ', error)
                          return response.status(500).json({
                            success: false,
                            message: 'Error agregando producto al carritoproducto',
                            error: error.message,
                          })
                        }
                        return response.status(201).json({
                          success: true,
                          message: 'Producto agregado al carritoproducto',
                          results,
                        })
                      }
                    )
                  }
                )
              }
            }
          )
        }
      )
    }
  )
}

const removeFromShoppingCart = (request, response) => {
  const { idUsuario, idProducto } = request.params

  console.log(idUsuario, idProducto)

  if (isNaN(idUsuario) || isNaN(idProducto)) {
    return response.status(400).json({
      success: false,
      message: 'Datos inválidos',
    })
  }

  // Obtener el ID del carrito
  db.query(
    'SELECT idCarrito FROM carrito WHERE idUsuario = ?',
    [idUsuario],
    (error, carritoResults) => {
      if (error) {
        console.error('Error realizando la consulta ', error)
        return response.status(500).json({
          success: false,
          message: 'Error obteniendo ID del carrito',
          error: error.message,
        })
      }

      if (carritoResults.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'Carrito no encontrado',
        })
      }

      const idCarrito = carritoResults[0].idCarrito

      // Eliminar el producto del carrito
      db.query(
        'DELETE FROM carritoproducto WHERE idCarrito = ? AND idProducto = ?',
        [idCarrito, idProducto],
        (error, results) => {
          if (error) {
            console.error('Error realizando la consulta ', error)
            return response.status(500).json({
              success: false,
              message: 'Error eliminando producto del carrito',
              error: error.message,
            })
          }

          if (results.affectedRows === 0) {
            return response.status(404).json({
              success: false,
              message: 'Producto no encontrado en el carrito',
            })
          }

          return response.status(200).json({
            success: true,
            message: 'Producto eliminado del carrito',
          })
        }
      )
    }
  )
}

module.exports = { getShoppingCart, addToShoppingCart, removeFromShoppingCart }