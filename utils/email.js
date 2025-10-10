const nodemailer = require('nodemailer')

// Define los parámetros del envío de correo
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_ONLINE,
    pass: process.env.PASSWORD_ONLINE,
  },
})

module.exports = {
  emailTransporter,
}
