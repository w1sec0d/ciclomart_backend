const crypto = require('crypto')

// Genera un código de verificación de 6 dígitos
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000)
}

module.exports = generateVerificationCode
