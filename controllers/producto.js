// This controller handles all product-related operations including CRUD, payments, and image management
const { MercadoPagoConfig, Preference } = require('mercadopago')
const { executeQuery, findUserById, insert } = require('../utils/dbHelpers')
const { sendSuccess, sendError, handleError } = require('../utils/responseHandler')
const { isValidNumber, validateRequiredFields } = require('../utils/validation')
const calculateFee = require('../utils/calculateFee')

// Gets all products from the database
const getProducto = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM vista_completa_producto')
    return sendSuccess(res, 'Products obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting products')
  }
}

// Gets all bicycles (filtered products)
const getBicicletas = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM vista_completa_producto WHERE tipo = "bicicleta"')
    return sendSuccess(res, 'Bicycles obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting bicycles')
  }
}

// Gets all components (filtered products)
const getComponentes = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM vista_completa_producto WHERE tipo = "componente"')
    return sendSuccess(res, 'Components obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting components')
  }
}

// Gets all products that have an offer/discount
const getProductosOferta = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM vista_completa_producto WHERE precioCompleto IS NOT NULL')
    return sendSuccess(res, 'Offer products obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting offer products')
  }
}

// Gets a single product by its ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidNumber(id)) {
      return sendError(res, 'Invalid product ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM vista_completa_producto WHERE idProducto = ?',
      [id]
    )

    return sendSuccess(res, 'Product obtained successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting product')
  }
}

// Creates a MercadoPago payment preference for a product purchase
const createPreference = async (req, res) => {
  try {
    const { producto, cantidad, idComprador } = req.body

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['producto', 'cantidad', 'idComprador'])
    if (!validation.isValid) {
      return sendError(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Validate IDs
    if (!isValidNumber(idComprador) || !isValidNumber(producto.idVendedor) || !isValidNumber(producto.idProducto)) {
      return sendError(res, 'Invalid ID values', 400)
    }

    // Get seller information
    const vendedor = await findUserById(producto.idVendedor)
    if (!vendedor) {
      return sendError(res, 'Seller not found', 404)
    }

    // Get buyer information
    const comprador = await findUserById(idComprador)
    if (!comprador) {
      return sendError(res, 'Buyer not found', 404)
    }

    // Create cart
    const carritoResults = await executeQuery(
      `INSERT INTO carrito (idPreferencia, idPago, idVendedor, idComprador, estado, metodoPago, precioTotal, fecha, direccionEnvio)
       VALUES (?, ?, ?, ?, 'pendiente_pago', ?, ?, NOW(), ?)`,
      [
        null, // idPreferencia
        null, // idPago
        producto.idVendedor,
        idComprador,
        'MercadoPago',
        producto.precio * cantidad,
        'Direccion de envio',
      ]
    )

    const carritoId = carritoResults.insertId

    // Configure MercadoPago client with seller's access_token
    const mercadoPagoClient = new MercadoPagoConfig({
      accessToken: vendedor.mp_access_token,
      options: {
        idempotencyKey: Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
    })
    const preference = new Preference(mercadoPagoClient)

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
    await executeQuery(
      'UPDATE carrito SET idPreferencia = ? WHERE idCarrito = ?',
      [idPreferenciaPago, carritoId]
    )

    // Create cart product relationship
    await executeQuery(
      'INSERT INTO carritoProducto (idCarrito, idProducto, cantidad) VALUES (?, ?, ?)',
      [carritoId, producto.idProducto, cantidad]
    )

    return sendSuccess(res, 'MercadoPago preference created successfully', {
      preferenceId: preferenceResult.id,
      paymentURL: preferenceResult.init_point,
      preferenceResult,
    })
  } catch (error) {
    return handleError(res, error, 'Error creating MercadoPago preference')
  }
}

// Publishes a new product to the marketplace
const publishProducto = async (req, res) => {
  try {
    const {
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

    // Validate required fields
    const validation = validateRequiredFields(req.body, [
      'nombre', 'tipo', 'precio', 'cantidad', 'estado', 'idVendedor', 'idMarca'
    ])
    if (!validation.isValid) {
      return sendError(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400)
    }

    // Convert boolean values to 0 or 1
    const retiroInt = retiro ? 1 : 0

    // Insert into the modelo table
    const modeloResult = await executeQuery(
      'INSERT INTO modelo (nombre, tipo, descripcion, categoria, compatibilidad, idMarca) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, tipo, descripcion, categoria, compatibilidad, idMarca]
    )

    const modeloId = modeloResult.insertId

    if (!modeloId) {
      return sendError(res, 'Error getting model ID', 500)
    }

    // Insert into the producto table
    const productoResult = await executeQuery(
      'INSERT INTO producto (idModelo, idVendedor, idTienda, exposicion, precio, precioCompleto, cantidad, estado, disponibilidad, costoEnvio, retiroEnTienda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [modeloId, idVendedor, idTienda, exposicion, precio, precioCompleto, cantidad, estado, disponibilidad, costoEnvio, retiroInt]
    )

    // Insert into the corresponding type table if it's a bicycle
    if (tipo === 'bicicleta') {
      const tipoData = {
        idBicicleta: modeloId,
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
        pesoBicicleta: req.body.pesoBicicleta !== '' ? req.body.pesoBicicleta : null,
        pesoMaximo: req.body.pesoMaximo !== '' ? req.body.pesoMaximo : null,
        extras: req.body.extras,
        tarjeta: req.body.tarjeta,
      }

      const bicicletaColumns = Object.keys(tipoData).filter(
        (key) => tipoData[key] !== undefined
      )
      const bicicletaValues = bicicletaColumns.map((key) => tipoData[key])
      const bicicletaPlaceholders = bicicletaColumns.map(() => '?').join(', ')

      await executeQuery(
        `INSERT INTO bicicleta (${bicicletaColumns.join(', ')}) VALUES (${bicicletaPlaceholders})`,
        bicicletaValues
      )
    }

    return sendSuccess(res, 'Product published successfully', {
      idProducto: productoResult.insertId,
    })
  } catch (error) {
    return handleError(res, error, 'Error publishing product')
  }
}

// Gets available models for a product type and brand
const getModels = async (req, res) => {
  try {
    const { tipo, id } = req.params

    if (!isValidNumber(id)) {
      return sendError(res, 'Invalid brand ID', 400)
    }

    const models = await executeQuery(
      'SELECT nombre FROM modelo WHERE tipo = ? AND idMarca = ?',
      [tipo, id]
    )

    return sendSuccess(res, 'Models retrieved successfully', models)
  } catch (error) {
    return handleError(res, error, 'Error getting models')
  }
}

// Gets all available brands
const getBrands = async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM marca')
    return sendSuccess(res, 'Brands retrieved successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting brands')
  }
}

// Uploads an image for a product
const uploadImage = async (req, res) => {
  try {
    const { idProducto, file } = req.body

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['idProducto', 'file'])
    if (!validation.isValid) {
      return sendError(res, 'Image file and product ID are required', 400)
    }

    if (!isValidNumber(idProducto)) {
      return sendError(res, 'Invalid product ID', 400)
    }

    const results = await executeQuery(
      'INSERT INTO imagen (idModelo, url) VALUES (?, ?)',
      [idProducto, file]
    )

    return sendSuccess(res, 'Image uploaded successfully', results, 201)
  } catch (error) {
    return handleError(res, error, 'Error uploading image')
  }
}

// Gets all images for a product
const getImages = async (req, res) => {
  try {
    const { idProducto } = req.params

    if (!isValidNumber(idProducto)) {
      return sendError(res, 'Invalid product ID', 400)
    }

    const results = await executeQuery(
      'SELECT * FROM imagen WHERE idModelo = ?',
      [idProducto]
    )

    return sendSuccess(res, 'Images retrieved successfully', results)
  } catch (error) {
    return handleError(res, error, 'Error getting images')
  }
}

// Adds a new brand to the system
const addBrand = async (req, res) => {
  try {
    const { nombre } = req.body

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['nombre'])
    if (!validation.isValid) {
      return sendError(res, 'Brand name is required', 400)
    }

    const results = await executeQuery('INSERT INTO marca (nombre) VALUES (?)', [nombre])

    return sendSuccess(res, 'Brand added successfully', results, 201)
  } catch (error) {
    return handleError(res, error, 'Error adding brand')
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
