const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')
require('dotenv').config({path: './controllers/.env'})

const login = async (req, res) => {

    const {email, password} = req.body;

    db.query('SELECT * FROM usuario WHERE correo = ?',[email],
        async (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'internal server error'
                })
            }

            if (result.length === 0){
                return res.status(401).json({
                    message: 'Failed'
                })
            }

            const user = result[0]

            const passwordUser = await bcrypt.compare(password, user.password);

            if(!passwordUser){
                return res.status(401).json({
                    message: 'Failed'
                })
            }

            const userForToken = {
                id: user.idUsuario,
                correo: user.correo,
                username: user.username
            }

            const token = jwt.sign(userForToken, process.env.JWT_SECRET,
                {expiresIn: '1h'}
            )

            res.status(200).json({
                token,
                user: result[0]
            })
        }
    );
}

module.exports = {
    login
}