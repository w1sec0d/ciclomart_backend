const db = require('../database/connection')

const getProducto = async (req, res) => {
  try {
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
    })
  }
}

const publishProducto = async (req, res) => {
  const {
    // Datos para la tabla producto
    idModelo,
    idVendedor,
    idTienda,
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
      pesoBicicleta: req.body.pesoBicicleta,
      pesoMaximo: req.body.pesoMaximo,
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
    const [resultModel] = await db.query(modelQuery, modelValues)

    const productoId = resultModel.insertId

    const productoColumns = [
      'idModelo',
      'idVendedor',
      'idTienda',
      'precio',
      'precioCompleto',
      'cantidad',
      'estado',
      'disponibilidad',
      'costoEnvio',
      'retiroEnTienda',
    ]
    const productoValues = [
      productoId,
      idVendedor,
      idTienda,
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
    const [resultProduct] = await db.query(productoQuery, productoValues)

    // Insertar en la tabla correspondiente
    if (tipo === 'bicicleta') {
      tipoData['idBicicleta'] = productoId
      const bicicletaColumns = Object.keys(tipoData).filter(
        (key) => tipoData[key] !== undefined
      )
      const bicicletaValues = bicicletaColumns.map((key) => tipoData[key])
      const bicicletaPlaceholders = bicicletaColumns.map(() => '?').join(', ')

      const bicicletaQuery = `INSERT INTO bicicleta (${bicicletaColumns.join(', ')}) VALUES (${bicicletaPlaceholders})`
      await db.query(bicicletaQuery, [...bicicletaValues])
    }

    res.status(200).json({
      success: true,
      message: 'Producto publicado exitosamente',
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
    const [brands] = await db.query('SELECT * FROM marca')
    res.status(200).json({
      success: true,
      brands,
    })
  } catch (error) {
    console.error('Error obteniendo marcas:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo marcas',
    })
  }
}

module.exports = { getProducto, publishProducto, getModels, getBrands }
