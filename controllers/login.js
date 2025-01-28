// Descripcion: Contiene la lógica de las peticiones de login

// Carga variables de entorno y módulos necesarios
require('dotenv').config()
const db = require('../database/connection')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const emailTransporter = require('../utils/emailTransporter')
const generateVerificationCode = require('../utils/generateVerificationCode')

// Función para loguear al usuario
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Credenciales incompletas, verifica tus datos',
    })
  }

  db.query(
    'SELECT * FROM usuario WHERE correo = ?',
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error en el servidor, intentalo más tarde',
          error: err.message,
        })
      }

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas, intentalo de nuevo',
        })
      }

      const user = result[0]
      const passwordUser = await bcrypt.compare(password, user.password)

      if (!passwordUser) {
        return res.status(401).json({
          success: false,
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
        success: true,
        message: 'Login exitoso',
        data: { token, user: result[0] },
      })
    }
  )
}

// Verifica si el email existe en la base de datos
const isEmailAvailable = async (email) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM usuario WHERE correo = ?',
        [email],
        (err, result) => {
          if (err) {
            return reject(err)
          }
          if (result.length === 0) {
            return resolve(true) // Correo no existe
          }
          resolve(false) // Correo existe
        }
      )
    })
    return result
  } catch (error) {
    console.error('Error verificando el email:', error)
    throw error
  }
}

// Envía un correo al usuario para recuperar su cuenta
const sendRecover = async (req, res) => {
  try {
    const email = req.body.data
    const user = await isEmailAvailable(email)
    if (!user) {
      const userForToken = { correo: email }
      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: '1h',
      })
      await sendRecoverEmail(email, token)
      return res.status(200).json({
        success: true,
        message: 'Se ha enviado un correo de verificación a tu correo',
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'El correo no existe en el sistema, verifícalo de nuevo',
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor, intentalo más tarde',
      error: err.message,
    })
  }
}

// Envía un código para terminar el registro
const sendRegisterCode = async (req, res) => {
  try {
    const { email, nombre, apellido, password } = req.body.data
    if (!req.body.data) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos de registro, intentalo de nuevo',
      })
    }

    const code = generateVerificationCode()

    const userForToken = { correo: email, nombre, apellido, password, code }
    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    const isEmailAvailable = await isEmailAvailable(email)

    if (!isEmailAvailable) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya se encuentra registrado',
      })
    }

    await sendVerificationCode(email, token, code)
    return res.status(200).json({
      success: true,
      message: 'Codigo de confirmación enviado con éxito',
      data: { email, token },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor, intentalo más tarde',
      error: error.message,
    })
  }
}

// Valida si el código introducido por el usuario es igual al código almacenado en el token
const validateCode = async (req, res) => {
  const codigo = parseInt(req.body.data.code)
  const token = req.body.token

  const decoded = verifyToken(token)
  const { correo, nombre, apellido, password, code } = decoded

  if (codigo === code) {
    return res.status(200).json({
      success: true,
      message: 'Código validado correctamente',
      data: { correo, nombre, apellido, password },
    })
  } else {
    return res.status(400).json({
      success: false,
      message: 'Codigo no congruente! Intentalo de nuevo',
    })
  }
}

// Evalúa el token para restablecer la contraseña
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token has expired')
    } else {
      console.error('Token verification failed:', error)
    }
    throw error
  }
}

// Actualiza la contraseña del usuario
const updatePassword = async (req, res) => {
  const { data, token } = req.body

  try {
    const decoded = verifyToken(token)
    const hashedPassword = await bcrypt.hash(data, 10)

    db.query(
      'UPDATE usuario SET password = ? WHERE correo = ?',
      [hashedPassword, decoded.correo],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error en el servidor, intentalo más tarde',
            error: err.message,
          })
        } else {
          return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada con éxito',
          })
        }
      }
    )
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Token inválido o expirado',
      error: err.message,
    })
  }
}

// Envía el correo al usuario (recuperación de contraseña)
const sendRecoverEmail = async (email, token) => {
  await emailTransporter.sendMail({
    from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Recuperación de contraseña',
    text: `¡Hola!, para restablecer tu contraseña, ingresa al siguiente enlace: ${process.env.FRONTEND_URL}/passwordRecovery/${token}`,
    html: `<b>Hola, para restablecer tu contraseña, ingresa al siguiente enlace: <a href="${process.env.FRONTEND_URL}/passwordRecovery/${token}">Restablecer Contraseña</a></b>`,
  })
}

// Envía el código al usuario (para terminar el registro)
const sendVerificationCode = async (email, token, code) => {
  await emailTransporter.sendMail({
    from: '"Ciclo Mart Soporte" <ciclomartsoporte@gmail.com>',
    to: email,
    subject: 'Código CicloMart',
    text: `¡Hola!, este es tu código de verificación: ${code} Puedes ingresar el código en CicloMart o hacer click aquí: ${process.env.FRONTEND_URL}/verificationCode/${token}?code=${code}`,
    html: `¡Hola!, este es tu código de verificación: <b>${code}</b> Puedes ingresar el código en CicloMart o hacer click aquí: <a href="${process.env.FRONTEND_URL}/verificationCode/${token}?code=${code}">Da click aquí</a>`,
  })
}

module.exports = {
  login,
  sendRecover,
  verifyToken,
  updatePassword,
  sendRegisterCode,
  validateCode,
  isEmailAvailable,
}
