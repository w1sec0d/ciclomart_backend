const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')

const userInfo = async (req, res) => {

    // Obtiene el encabezado de la autorización de la solicitud
    const authHeader = req.headers.authorization; 

    if (!authHeader || !authHeader.startsWith('Bearer ')) 
    { 
        return res.status(401).json({ message: 'No token provided' });
    } 

    const token = authHeader.split(' ')[1];

    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        db.query('SELECT * FROM usuario WHERE idUsuario = ?', [decoded.id], 
        (err, result) => { 
            if (err) { 
                return res.status(500).json({ 
                    message: 'internal server error' 
                }); 
            } 
            if (result.length === 0) { 
                return res.status(404).json({ message: 'User not found' }); 
            } 
            const user = result[0]; 
            res.status(200).json({ user }); }); 
            
    } catch (error) { 
        res.status(401).json({ 
            message: 'Token is not valid' }); 
    }
}

module.exports = {
    userInfo
}