// Generates a 6 number safe verification code 
const crypto = require('crypto')

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000)
}

module.exports = generateVerificationCode
