const db = require('../database/connection')
// importa mercadoPagoClient
const { preference } = require('../utils/mercadoPago')

const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM vista_completa_producto', (error, results) => {
      if (error) {
        console.error('Error obteniendo productos:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo productos',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Productos obtenidos exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message,
    })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido',
      })
    }

    db.query(
      'SELECT * FROM vista_completa_producto WHERE idProducto = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error obteniendo producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error obteniendo producto',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Producto obtenido exitosamente',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error obteniendo producto:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: error.message,
    })
  }
}

const createPreference = async (req, res) => {
  try {
    const { title, quantity, unit_price, idComprador, idProducto } = req.body

    // Crear carrito
    const carritoQuery = `
      INSERT INTO carrito (idUsuario, cantidadProductos, precioTotal, fecha, estado, metodoPago, direccionEnvio, descuento)
      VALUES (?, ?, ?, NOW(), 'pendiente_pago', ?, ?, ?)
    `
    const carritoValues = [
      idComprador,
      quantity,
      unit_price * quantity,
      'MercadoPago',
      'Direccion de envio',
      0,
    ]

    db.query(carritoQuery, carritoValues, (error, carritoResults) => {
      if (error) {
        console.error('Error creando carrito:', error)
        return res.status(500).json({
          success: false,
          message: 'Error creando carrito',
          error: error.message,
        })
      }

      const carritoId = carritoResults.insertId

      // Crear carritoProducto
      const carritoProductoQuery = `
        INSERT INTO carritoProducto (idProducto, idCarrito, cantidad, precio_unitario, direccion, estadoEnvio)
        VALUES (?, ?, ?, ?, ?, 'Pendiente')
      `
      const carritoProductoValues = [
        idProducto,
        carritoId,
        quantity,
        unit_price,
        'Direccion de envio',
      ]

      db.query(
        carritoProductoQuery,
        carritoProductoValues,
        async (error, carritoProductoResults) => {
          if (error) {
            console.error('Error creando carritoProducto:', error)
            return res.status(500).json({
              success: false,
              message: 'Error creando carritoProducto',
              error: error.message,
            })
          }

          const preferenceBody = {
            items: [
              {
                title,
                quantity: Number(quantity),
                unit_price: Number(unit_price),
                currency_id: 'COP',
              },
            ],
            back_urls: {
              success:
                process.env.FRONTEND_URL + '/requestResult/purchaseComplete',
              failure:
                process.env.FRONTEND_URL + '/requestResult/purchaseFailed',
              pending:
                process.env.FRONTEND_URL + '/requestResult/purchasePending',
            },
            auto_return: 'approved',
            notification_url: process.env.BACKEND_URL + '/webhookMercadoLibre',

            external_reference: carritoId,

          }
          const result = await preference.create({
            body: preferenceBody,
          })


          // Actualizar carrito con el id de la preferencia
          db.query(
            'UPDATE carrito SET idPreferenciaPago = ? WHERE idCarrito = ?',
            [result.id, carritoId],
            (error, results) => {
              if (error) {
                console.error('Error actualizando carrito:', error)
                return res.status(500).json({
                  success: false,
                  message: 'Error actualizando carrito',
                  error: error.message,
                })
              }
            }
          )


          return res.status(200).json({
            success: true,
            message: 'Preferencia de MercadoPago creada exitosamente',
            preferenceId: result.id,
            paymentURL: result.init_point,
            result,
          })
        }
      )
    })
  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error)
    res.status(500).json({
      success: false,
      message: 'Error creando preferencia de MercadoPago',
      error: error.message,
    })
  }
}

const publishProducto = async (req, res) => {
  const {
    // Datos para la tabla producto
    idModelo,
    idVendedor,
    idTienda,
    exposicion,
    precio,
    precioCompleto,
    cantidad,
    estado,
    disponibilidad,
    costoEnvio,
    retiro,
    nombre,
    tipo,
    descripcion,
    categoria,
    compatibilidad,
    idMarca,
  } = req.body

  // Convertir valores booleanos a 0 o 1
  const retiroInt = retiro ? 1 : 0
  // Datos para la tabla del tipo correspondiente
  let tipoData = {}
  if (tipo === 'bicicleta') {
    tipoData = {
      idBicicleta: 0,
      tipoBicicleta: req.body.tipoBicicleta,
      color: req.body.color,
      genero: req.body.genero,
      edad: req.body.edad,
      tamañoMarco: req.body.tamañoMarco,
      materialMarco: req.body.materialMarco,
      tamañoRueda: req.body.tamañoRueda,
      tipoFrenos: req.body.tipoFrenos,
      velocidades: req.body.velocidades,
      suspension: req.body.tipoSuspension,
      transmision: req.body.transmision,
      tipoPedales: req.body.tipoPedales,
      manubrio: req.body.tipoManubrio,
      pesoBicicleta:
        req.body.pesoBicicleta != '' ? req.body.pesoBicicleta : null,
      pesoMaximo: req.body.pesoMaximo != '' ? req.body.pesoBicicleta : null,
      extras: req.body.extras,
    }
  }

  try {
    // Insertar en la tabla producto
    const modelColumns = [
      'nombre',
      'tipo',
      'descripcion',
      'categoria',
      'compatibilidad',
      'idMarca',
    ]
    const modelValues = [
      nombre,
      tipo,
      descripcion,
      categoria,
      compatibilidad,
      idMarca,
    ]
    const modelPlaceholders = modelColumns.map(() => '?').join(', ')

    const modelQuery = `INSERT INTO modelo (${modelColumns.join(', ')}) VALUES (${modelPlaceholders})`
    db.query(modelQuery, modelValues, (error, results) => {
      if (error) {
        console.error('Error publicando producto:', error)
        return res.status(500).json({
          success: false,
          message: 'Error al publicar el producto',
        })
      }
      console.log('results', results)
      const modeloId = results.insertId

      if (!modeloId) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener el id del producto',
        })
      }

      const productoColumns = [
        'idModelo',
        'idVendedor',
        'idTienda',
        'exposicion',
        'precio',
        'precioCompleto',
        'cantidad',
        'estado',
        'disponibilidad',
        'costoEnvio',
        'retiroEnTienda',
      ]
      const productoValues = [
        modeloId,
        idVendedor,
        idTienda,
        exposicion,
        precio,
        precioCompleto,
        cantidad,
        estado,
        disponibilidad,
        costoEnvio,
        retiroInt,
      ]
      const productoPlaceholders = productoColumns.map(() => '?').join(', ')

      const productoQuery = `INSERT INTO producto (${productoColumns.join(', ')}) VALUES (${productoPlaceholders})`
      // const [resultProduct] = await db.query(productoQuery, productoValues)
      db.query(productoQuery, productoValues, (error, results) => {
        try {
          // Insertar en la tabla correspondiente
          if (tipo === 'bicicleta') {
            tipoData['idBicicleta'] = modeloId
            const bicicletaColumns = Object.keys(tipoData).filter(
              (key) => tipoData[key] !== undefined
            )
            const bicicletaValues = bicicletaColumns.map((key) => tipoData[key])
            const bicicletaPlaceholders = bicicletaColumns
              .map(() => '?')
              .join(', ')

            const bicicletaQuery = `INSERT INTO bicicleta (${bicicletaColumns.join(', ')}) VALUES (${bicicletaPlaceholders})`

            console.log('bicicletaQuery', bicicletaQuery)
            console.log('values', bicicletaValues)
            db.query(bicicletaQuery, [...bicicletaValues], (error, results) => {
              if (error) {
                console.error('Error publicando producto:', error)
                return res.status(500).json({
                  success: false,
                  message: 'Error al publicar el producto',
                })
              }
            })
          }
          const idProducto = results.insertId
          res.status(200).json({
            success: true,
            message: 'Producto publicado exitosamente',
            dProducto: idProducto,
          })
        } catch (error) {
          console.error('Error publicando producto:', error)
          return res.status(500).json({
            success: false,
            message: 'Error al publicar el producto',
          })
        }
      })
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error al publicar el producto',
    })
  }
}

const getModels = async (req, res) => {
  tipo = req.params.tipo
  id = req.params.id
  try {
    const [models] = await db.query(
      'SELECT nombre FROM modelo WHERE tipo = ? AND idMarca = ?',
      [tipo, id]
    )
    res.status(200).json({
      success: true,
      models,
    })
  } catch (error) {
    console.error('Error obteniendo modelos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo modelos',
    })
  }
}

const getBrands = async (req, res) => {
  try {
    db.query('SELECT * FROM marca', (error, results) => {
      if (error) {
        console.error('Error obteniendo marcas:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo marcas',
        })
      }

      res.status(200).json({
        success: true,
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo marcas:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo marcas',
    })
  }
}

const uploadImage = async(req, res) => {
  try {
    
    const { idProducto, file } = req.body
    console.log(idProducto, file)


    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó una imagen',
      })
    }

    const imageQuery = `
      INSERT INTO imagen (idModelo, url)
      VALUES (?, ?)
    `
    const imageValues = [
      idProducto,
      file,
    ]

    db.query(imageQuery, imageValues, (error, results) => {
      if (error) {
        console.error('Error subiendo imagen:', error)
        return res.status(500).json({
          success: false,
          message: 'Error subiendo imagen',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    res.status(500).json({
      success: false,
      message: 'Error subiendo imagen',
      error: error.message,
    })
  }
}

const getImages = async(req, res) => {
  try {
    const { idProducto } = req.params
    db.query('SELECT * FROM imagen WHERE idModelo = ?', [idProducto], (error, results) => {
      if (error) {
        console.error('Error obteniendo imagenes:', error)
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo imagenes',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Imagenes obtenidas exitosamente',
        results,
      })
    })
  } catch (error) {
    console.error('Error obteniendo imagenes:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo imagenes',
      error: error.message,
    })
  }
}

module.exports = {
  getProducto,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
  uploadImage,
  getImages
}
