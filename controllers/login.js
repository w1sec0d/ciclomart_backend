const db = require('../database/connection')
// third party libraries
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

require('dotenv').config({ path: './controllers/.env' })

const { registerUsuario } = require('./usuario')
const { json } = require('body-parser')

const generateVerificationCode = () => {
  return crypto.randomInt(1000000, 10000000) // Generates a 7-digit number
}

// Función para loguear al usuario
const login = async (req, res) => {
  const { email, password } = req.body

  db.query(
    'SELECT * FROM usuario WHERE correo = ?',
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error en el servidor, intentalo más tarde',
        })
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: 'Credenciales incorrectas, intentalo de nuevo',
        })
      }

      const user = result[0]

      const passwordUser = await bcrypt.compare(password, user.password)

      if (!passwordUser) {
        return res.status(401).json({
          message: 'Credenciales incorrectas, intentalo de nuevo',
        })
      }

      const userForToken = {
        id: user.idUsuario,
        correo: user.correo,
        username: user.username,
      }

      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '1h',
      })

      res.status(200).json({
        token,
        user: result[0],
      })
    }
  )
}

// Funcion para verificar si el email existe en la bd

const verifyEmail = async (email) => {
  console.log('email', email)

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM usuario WHERE correo = ?',
        [email],
        (err, result) => {
          if (err) {
            return reject(err)
          }
          resolve(result)
        }
      )
    })
    return result.length === 0
  } catch (error) {
    console.error('Error verifying email:', error)
  }
}

//Función que envia un correo al usuario para recuperar su cuenta
const sendEmail = async (req, res) => {
  try {
    const email = req.body.data

    const user = await verifyEmail(email)
    if (user) {
      const userForToken = {
        correo: email,
      }

      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '1h',
      })

      await sendVerificationEmail(email, token)

      return res.status(200).json({
        message: 'exito',
      })
    } else {
      return res.status(401).json({
        message: 'Error en el servidor, intentalo más tarde',
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Error en el servidor, intentalo más tarde',
    })
  }
}

//Función que envia un código para terminar el registro
const sendRegisterCode = async (req, res) => {
  try {
    const { email, nombre, apellido, password } = req.body.data

    const code = generateVerificationCode()
    const userForToken = {
      correo: email,
      nombre: nombre,
      apellido: apellido,
      password: password,
      code: code,
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })

    // validate email
    const isEmailAvailable = await verifyEmail(email)
    if (!isEmailAvailable) {
      return res.status(400).json({
        message: 'El correo ya se encuentra registrado',
      })
    }

    await sendVerificationCode(email, token, code)

    return res.status(200).json({
      message: 'Codigo de confirmación enviado con éxito',
      email,
      token,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error en el servidor, intentalo más tarde',
    })
  }
}

const evaluateToken = (req, res) => {
  const { token } = req.params
  console.log('Holii desde evaluateToken')
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.send(
      ` <form id="resetPasswordForm" method="post" action="/api/updatePassword"> <input type="hidden" name="token" value="${token}"> <input type="password" name="password" required> <input type="submit" value="Reset Password"> </form> <script> document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; const formData = new FormData(form); const data = { token: formData.get('token'), password: formData.get('password') }; const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); console.log(result); }); </script> `
    )
  } catch (err) {
    res.status(400).send('Invalid o expired token')
  }
}

// Función que valida si el codigo introducido por el usuario es igual al código almacenado en el token
const validateCode = async (req, res) => {
  const codigo = parseInt(req.body.data.code)
  const token = req.body.token

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const { correo, nombre, apellido, password, code } = decoded

  console.log('codigo usuario: ', typeof codigo)
  console.log('codigo token: ', typeof code)

  if (codigo === code) {
    return res.status(200).json({
      correo: correo,
      nombre: nombre,
      apellido: apellido,
      password: password,
    })
  } else {
    return res.status(400).json({
      message: 'Faild',
    })
  }
}

//Función que se utiliza para actualizar el password
const updatePassword = async (req, res) => {
  const { data, token } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const hashedPassword = await bcrypt.hash(data, 10)

    db.query(
      'UPDATE usuario SET password = ? WHERE correo = ?',
      [hashedPassword, decoded.correo],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: 'Error en el servidor, intentalo más tarde',
          })
        } else {
          return res.status(200).json({
            message: 'exito',
          })
        }
      }
    )
  } catch (err) {
    res.status(400).send('Invalid o expired token')
  }
}

// Función que define los parametros del envio de correo

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ONLINE,
    pass: process.env.PASSWORD_ONLINE,
  },
})

//Función que envia el correo al usuario (recuperación de contraseña)

const sendVerificationEmail = async (email, token) => {
  await transporter.sendMail({
    from: '"Ciclo Mart Soport" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Recuperación de contraseña',
    text: `¡Hola!, para restablecer tu contraseña, ingresa al siguiente enlace: ${process.env.FRONTEND_URL}/passwordRecovery/${token}`,
    html: `<b>Hola, para restablecer tu contraseña, ingresa al siguiente enlace: <a href="${process.env.FRONTEND_URL}/passwordRecovery/${token}">Restablecer Contraseña</a></b>`,
  })
}

//Función que envia el código al usuario (para terminar el registro)
const sendVerificationCode = async (email, token, code) => {
  console.log('code', code)

  await transporter.sendMail({
    from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Código CicloMart',
    text: `¡Hola!, este es tu código de verificación: ${code} Puedes ingresar el código en CicloMart o hacer click aquí: ${process.env.FRONTEND_URL}/verificationCode/${token}?code=${code}`,
    html: `¡Hola!, este es tu código de verificación: <b>${code}</b> Puedes ingresar el código en CicloMart o hacer click aquí: <a href="${process.env.FRONTEND_URL}/verificationCode/${token}?code=${code}">Da click aquí</a>`,
  })
}

module.exports = {
  login,
  sendEmail,
  evaluateToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
  verifyEmail,
}
