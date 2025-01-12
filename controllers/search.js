const db = require('../database/connection')

const search = (request, response) => {
    const { nombre, tipo, categoria, marca, minFecha, maxFecha } = request.query;

    console.log('Funciona')
    
    let query = 'SELECT * FROM producto WHERE 1=1';
    const queryParams = [];

    if (nombre) {
        query += ' AND nombre LIKE ?';
        queryParams.push(`%${nombre}%`);
    }

    if (tipo) {
        query += ' AND tipo = ?';
        queryParams.push(tipo);
    }

    if (categoria) {
        query += ' AND categoria = ?';
        queryParams.push(categoria);
    }

    if (marca) {
        query += ' AND marca = ?';
        queryParams.push(marca);
    }

    if (minFecha) {
        query += ' AND fechaRegistro >= ?';
        queryParams.push(minFecha);
    }

    if (maxFecha) {
        query += ' AND fechaRegistro <= ?';
        queryParams.push(maxFecha);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error executing query', error)
            response.status(500).send('Internal server error')
            return
        }
        response.json(results)
    })
}

module.exports = { search }