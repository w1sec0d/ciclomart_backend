// This controller handles all product-related operations including CRUD, payments, and image management
const { MercadoPagoConfig, Preference } = require('mercadopago')
const db = require('../database/connection')
const calculateFee = require('../utils/calculateFee')

// Gets all products from the database
const getProducto = async (req, res) => {
  try {
    db.query('SELECT * FROM vista_completa_producto', (error, results) => {
      if (error) {
        console.error('Error getting products:', error)
        return res.status(500).json({
          success: false,
          message: 'Error getting products',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Products obtained successfully',
        results,
      })
    })
  } catch (error) {
    console.error('Error getting products:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting products',
      error: error.message,
    })
  }
}

// Gets all bicycles (filtered products)
const getBicicletas = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE tipo = "bicicleta"',
      (error, results) => {
        if (error) {
          console.error('Error getting bicycles:', error)
          return res.status(500).json({
            success: false,
            message: 'Error getting bicycles',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Bicycles obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error getting bicycles:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting bicycles',
      error: error.message,
    })
  }
}

// Gets all components (filtered products)
const getComponentes = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE tipo = "componente"',
      (error, results) => {
        if (error) {
          console.error('Error getting components:', error)
          return res.status(500).json({
            success: false,
            message: 'Error getting components',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Components obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error getting components:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting components',
      error: error.message,
    })
  }
}

// Gets all products that have an offer/discount
const getProductosOferta = async (req, res) => {
  try {
    db.query(
      'SELECT * FROM vista_completa_producto WHERE  precioCompleto IS NOT NULL',
      (error, results) => {
        if (error) {
          console.error('Error getting offer products:', error)
          return res.status(500).json({
            success: false,
            message: 'Error getting offer products',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Offer products obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error getting offer products:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting offer products',
      error: error.message,
    })
  }
}

// Gets a single product by its ID
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      })
    }

    db.query(
      'SELECT * FROM vista_completa_producto WHERE idProducto = ?',
      [id],
      (error, results) => {
        if (error) {
          console.error('Error getting product:', error)
          return res.status(500).json({
            success: false,
            message: 'Error getting product',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Product obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error getting product:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting product',
      error: error.message,
    })
  }
}

// Creates a MercadoPago payment preference for a product purchase
const createPreference = async (req, res) => {
  try {
    const { producto, cantidad, idComprador } = req.body
    // GET SELLER AND BUYER DATA

    // Get seller information
    const vendedorQuery = 'SELECT * FROM usuario WHERE idUsuario = ?'
    const [vendedor] = await new Promise((resolve, reject) => {
      db.query(vendedorQuery, [producto.idVendedor], (error, results) => {
        if (error) {
          console.error('Error getting seller:', error)
          return reject({
            success: false,
            message: 'Error getting seller',
            error: error.message,
          })
        }
        resolve(results)
      })
    })
    if (!vendedor || vendedor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      })
    }

    // Get buyer information
    const compradorQuery = 'SELECT * FROM usuario WHERE idUsuario = ?'
    const [comprador] = await new Promise((resolve, reject) => {
      db.query(compradorQuery, [idComprador], (error, results) => {
        if (error) {
          console.error('Error getting buyer:', error)
          return reject({
            success: false,
            message: 'Error getting buyer',
            error: error.message,
          })
        }
        resolve(results)
      })
    })
    if (!comprador || comprador.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found',
      })
    }

    // REGISTER MERCADOPAGO PREFERENCE IN DATABASE

    // Create cart
    const carritoQuery = `
      INSERT INTO carrito (idPreferencia, idPago, idVendedor, idComprador, estado, metodoPago, precioTotal, fecha, direccionEnvio)
      VALUES (?, ?, ?, ?, 'pendiente_pago', ?, ?, NOW(), ?)

    `
    const carritoValues = [
      null, // idPreferencia
      null, // idPago
      producto.idVendedor,
      idComprador,
      'MercadoPago',
      producto.precio * cantidad,
      'Direccion de envio',
    ]

    const carritoResults = await new Promise((resolve, reject) => {
      db.query(carritoQuery, carritoValues, (error, results) => {
        if (error) {
          console.error('Error creating cart:', error)
          return reject({
            success: false,
            message: 'Error creating cart',
            error: error.message,
          })
        }
        resolve(results)
      })
    })

    const carritoId = carritoResults.insertId

    // CREATE MERCADOPAGO PREFERENCE

    // Configure MercadoPago client with seller's access_token
    const mercadoPagoClient = new MercadoPagoConfig({
      accessToken: vendedor.mp_access_token,
      options: {
        idempotencyKey:
          Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
    })
    const preference = new Preference(mercadoPagoClient)

    const freeShippingBody =
      Number(producto.costoEnvio) === 0 ? [{ id: 73328 }] : []

    const preferenceBody = {
      items: [
        {
          id: producto.idProducto,
          title: producto.nombre,
          description: producto.descripcionModelo,
          picture_url: producto.imagenURL,
          category_id: producto.tipo,
          quantity: Number(cantidad),
          currency_id: 'COP',
          unit_price: Number(producto.precio),
        },
      ],
      payer: {
        name: comprador.nombre,
        surname: comprador.apellido,
        email: comprador.correo,
        phone: {
          area_code: '57',
          number: comprador.telefono,
        },
        address: {

          zip_code: comprador.codigoPostal,
          street_name: comprador.direccionNombre,
          street_number: comprador.direccionNumero,

        },
      },
      payment_methods: {
        default_installments: 1,
      },
      back_urls: {
        success: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchaseComplete',
        failure: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchaseFailed',
        pending: process.env.FRONTEND_EXTERNAL_URL + '/requestResult/purchasePending',
      },
      notification_url: process.env.BACKEND_URL + '/webhookMercadoLibre',
      statement_descriptor: 'Compra CicloMart',
      auto_return: 'approved',
      external_reference: carritoId,
      marketplace_fee: calculateFee(producto.tipo, producto.precio),
    }

    const preferenceResult = await preference.create({ body: preferenceBody })
    const idPreferenciaPago = preferenceResult.id

    // Update cart with the preference ID
    await new Promise((resolve, reject) => {
      db.query(

        'UPDATE carrito SET idPreferencia = ? WHERE idCarrito = ?',

        [idPreferenciaPago, carritoId],
        (error, results) => {
          if (error) {
            console.error('Error updating cart:', error)
            return reject({
              success: false,
              message: 'Error updating cart',
              error: error.message,
            })
          }
          resolve(results)
        }
      )
    })

    // Create cart product relationship
    const carritoProductoQuery = `

      INSERT INTO carritoProducto (idCarrito, idProducto, cantidad)
      VALUES (?, ?, ?)
    `
    const carritoProductoValues = [
      carritoId,
      producto.idProducto,
      cantidad,

    ]

    await new Promise((resolve, reject) => {
      db.query(
        carritoProductoQuery,
        carritoProductoValues,
        (error, results) => {
          if (error) {
            console.error('Error creating cart product:', error)
            return reject({
              success: false,
              message: 'Error creating cart product',
              error: error.message,
            })
          }
          resolve(results)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'MercadoPago preference created successfully',
      preferenceId: preferenceResult.id,
      paymentURL: preferenceResult.init_point,
      preferenceResult,
    })
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating MercadoPago preference',
      error: error.message,
      error_object: error,
    })
  }
}

// Publishes a new product to the marketplace
const publishProducto = async (req, res) => {
  const {
    // Data for the product table
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

  // Convert boolean values to 0 or 1
  const retiroInt = retiro ? 1 : 0
  // Data for the corresponding type table
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
      tarjeta: req.body.tarjeta,
    }
  }

  try {
    // Insert into the product table
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
        console.error('Error publishing product:', error)
        return res.status(500).json({
          success: false,
          message: 'Error publishing product',
        })
      }
      console.log('results', results)
      const modeloId = results.insertId

      if (!modeloId) {
        return res.status(500).json({
          success: false,
          message: 'Error getting product ID',
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
          // Insert into the corresponding type table
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
                console.error('Error publishing product:', error)
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
            idProducto: idProducto,
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

// Gets available models for a product type and brand
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
    console.error('Error getting models:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting models',
    })
  }
}

// Gets all available brands
const getBrands = async (req, res) => {
  try {
    db.query('SELECT * FROM marca', (error, results) => {
      if (error) {
        console.error('Error getting brands:', error)
        return res.status(500).json({
          success: false,
          message: 'Error getting brands',
        })
      }

      res.status(200).json({
        success: true,
        results,
      })
    })
  } catch (error) {
    console.error('Error getting brands:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting brands',
    })
  }
}

// Uploads an image for a product
const uploadImage = async (req, res) => {
  try {
    const { idProducto, file } = req.body
    console.log(idProducto, file)

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image was provided',
      })
    }

    const imageQuery = `
      INSERT INTO imagen (idModelo, url)
      VALUES (?, ?)
    `
    const imageValues = [idProducto, file]

    db.query(imageQuery, imageValues, (error, results) => {
      if (error) {
        console.error('Error uploading image:', error)
        return res.status(500).json({
          success: false,
          message: 'Error uploading image',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        results,
      })
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    })
  }
}

// Gets all images for a product
const getImages = async (req, res) => {
  try {
    const { idProducto } = req.params
    db.query(
      'SELECT * FROM imagen WHERE idModelo = ?',
      [idProducto],
      (error, results) => {
        if (error) {
          console.error('Error getting images:', error)
          return res.status(500).json({
            success: false,
            message: 'Error getting images',
            error: error.message,
          })
        }

        res.status(200).json({
          success: true,
          message: 'Images obtained successfully',
          results,
        })
      }
    )
  } catch (error) {
    console.error('Error getting images:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting images',
      error: error.message,
    })
  }
}

// Adds a new brand to the system
const addBrand = async (req, res) => {
  try {
    const { nombre } = req.body
    db.query('INSERT INTO marca (nombre) VALUES (?)', [nombre], (error, results) => {
      if (error) {
        console.error('Error adding brand:', error)
        return res.status(500).json({
          success: false,
          message: 'Error adding brand',
          error: error.message,
        })
      }

      res.status(200).json({
        success: true,
        message: 'Brand added successfully',
        results,
      })
    })
  } catch (error) {
    console.error('Error adding brand:', error)
    res.status(500).json({
      success: false,
      message: 'Error adding brand',
      error: error.message,
    })
  }
}

module.exports = {
  getProducto,
  getBicicletas,
  getComponentes,
  getProductosOferta,
  getProductById,
  createPreference,
  publishProducto,
  getModels,
  getBrands,
  uploadImage,
  getImages,
  addBrand
}
