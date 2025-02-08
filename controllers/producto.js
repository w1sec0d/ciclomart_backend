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
    tipo, 
    nombre, 
    descripcion, 
    precio,
    precioCompleto, 
    imagen,
    idModelo,
    idMarca,
    disponibilidad,
    costoEnvio,
    retiroDisponible,
    fechaPublicacion,
    condicion } = req.body

  // Convertir valores booleanos a 0 o 1
  const retiroDisponibleInt = retiroDisponible ? 1 : 0;
  // Datos para la tabla del tipo correspondiente
  let tipoData = {};
  if(tipo === 'bicicleta'){
    tipoData = {
      idBicicleta: req.body.idBicicleta,
      tipoBicicleta: req.body.tipoBicicleta,
      color: req.body.color,
      genero: req.body.genero,
      edad: req.body.edad,
      tamañoMarco: req.body.tamañoMarco,
      materialMarco: req.body.materialMarco,
      tamañoRueda: req.body.tamañoRueda,
      tipoFrenos: req.body.tipoFrenos,
      velocidades: req.body.velocidades,
      suspension: req.body.suspension,
      transmision: req.body.transmision,
      tipoPedales: req.body.tipoPedales,
      manubrio: req.body.manubrio,
      pesoBicicleta: req.body.pesoBicicleta,
      pesoMaximo: req.body.pesoMaximo,
      extras: req.body.extras,
      idCadena: req.body.idCadena,
      idRueda: req.body.idRueda,
      idPedalier: req.body.idPedalier,
      idSillin: req.body.idSillin,
      idFreno: req.body.idFreno,
      idManubrio: req.body.idManubrio,
      idCassette: req.body.idCassette
    };
  }
  else if(tipo === 'repuesto'){
    tipoData = {
      idComponente: req.body.idComponente,
      idMarca: req.body.idMarca,
      categoria: req.body.categoria,
      modelo: req.body.modelo,
      compatibilidad: req.body.compatibilidad
    };
  }

  try {
    // Insertar en la tabla producto
    const productoColumns = ['tipo', 'nombre', 'descripcion', 'precio', 'precioCompleto', 'imagen', 'idModelo', 'idMarca', 'disponibilidad', 'costoEnvio', 'retiroDisponible', 'fechaPublicacion', 'condicion'];
    const productoValues = [tipo, nombre, descripcion, precio, precioCompleto, imagen,idModelo, idMarca, disponibilidad, costoEnvio, retiroDisponibleInt, fechaPublicacion, condicion];
    const productoPlaceholders = productoColumns.map(() => '?').join(', ');

    const productoQuery = `INSERT INTO producto (${productoColumns.join(', ')}) VALUES (${productoPlaceholders})`;
    const [result] = await db.query(productoQuery, productoValues);

    const productoId = result.insertId;

    // Insertar en la tabla correspondiente
    if(tipo === 'bicicleta'){
      tipoData['idBicicleta'] = productoId;
      const bicicletaColumns = Object.keys(tipoData).filter(key => tipoData[key] !== undefined);
      const bicicletaValues = bicicletaColumns.map(key => tipoData[key]);
      const bicicletaPlaceholders = bicicletaColumns.map(() => '?').join(', ');

      const bicicletaQuery = `INSERT INTO bicicleta (${bicicletaColumns.join(', ')}) VALUES (${bicicletaPlaceholders})`;
      await db.query(bicicletaQuery, [ ...bicicletaValues]);
    
    } else if(tipo === 'repuesto'){
      tipoData['idComponente'] = productoId;
      const componenteColumns = Object.keys(tipoData).filter(key => tipoData[key] !== undefined);
      const componenteValues = componenteColumns.map(key => tipoData[key]);
      const componentePlaceholders = componenteColumns.map(() => '?').join(', ');

      const componenteQuery = `INSERT INTO componente (idProducto, ${componenteColumns.join(', ')}) VALUES (${componentePlaceholders})`;
      
      await db.query(componenteQuery, [...componenteValues]);
    }

    res.status(200).json({
      success: true,
      message: 'Producto publicado exitosamente',
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
    })
  }
}

module.exports = { getProducto, publishProducto }
