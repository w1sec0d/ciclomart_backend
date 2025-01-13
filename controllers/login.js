const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database/connection')
const nodemailer = require("nodemailer");
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

// Funcion para verificar si el email existe en la bd

const verifyEmail = async (email) => { 
    return new Promise((resolve, reject) => { 
        
        db.query('SELECT * FROM usuario WHERE correo = ?', [email], (err, result) => { 
            if (err) { 
                reject(err); 
            } else if (result.length === 0) { 
                resolve(false);
             } else { 
                resolve(true);
             } 
        }); 
    }); 
};

const sendEmail = async (req, res) =>{

    try{
        const email = req.body.data
        const user = await verifyEmail(email);
        if(user){
            
            const userForToken = {
                correo: email
            }

            const token = jwt.sign(userForToken, process.env.JWT_SECRET, {expiresIn: '1h'})

            await sendVerificationEmail(email,token)

            return res.status(200).json({
                message:"success"
            })
        }else{
            return res.status(401).json({
                message: 'Failed'
            })
        }
    }catch(err){
        return res.status(401).json({
            message: 'Failed'
        })
    }
    
}

const evaluateToken = (req, res) => {
    const {token} = req.params;
    console.log("Holii desde evaluateToken")
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.send(` <form id="resetPasswordForm" method="post" action="/api/updatePassword"> <input type="hidden" name="token" value="${token}"> <input type="password" name="password" required> <input type="submit" value="Reset Password"> </form> <script> document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const formData = new FormData(form); const data = { token: formData.get('token'), password: formData.get('password') }; const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); console.log(result); }); </script> `);
    }catch(err){
        res.status(400).send('Invalid o expired token')
    }
}

const updatePassword = async (req, res) => {
    

    const {data, token} = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const hashedPassword = await bcrypt.hash(data, 10);

        db.query('UPDATE usuario SET password = ? WHERE correo = ?',[hashedPassword, decoded.correo],
            (err, result) => {
                if(err){
                    return res.status(500).json({
                        message: 'Failed'
                    })
                }else{
                    return res.status(200).json({
                        message: 'success'
                    })
                }
            }
        )

    }catch(err){
        res.status(400).send('Invalid o expired token');
    }
}




const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_ONLINE,
      pass: process.env.PASSWORD_ONLINE,
    },
  });

  const sendVerificationEmail = async (email, token) => { 
    await transporter.sendMail({ 
        from: '"Ciclo Mart Soport" <ciclomartsoporte@gmail.com>', 
        to: email, subject: "Recuperación de contraseña", 
        text: `¡Hola!, para restablecer tu contraseña, ingresa al siguiente enlace: http://localhost:5173/passwordRecovery/${token}`, 
        html: `<b>Hola, para restablecer tu contraseña, ingresa al siguiente enlace: <a href="http://localhost:5173/passwordRecovery/${token}">Restablecer Contraseña</a></b>`,
    });
  }





module.exports = {
    login,
    sendEmail,
    evaluateToken,
    updatePassword
}