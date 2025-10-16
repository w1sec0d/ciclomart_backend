// This route handles store related operations
const { executeQuery } = require('../utils/dbHelpers')
const { sendSuccess, handleError } = require('../utils/responseHandler')

// Gets all the stores
const getTiendas = async (request, response) => {
  try {
    const results = await executeQuery('SELECT * FROM tienda')
    return sendSuccess(response, 'Stores obtained successfully', results)
  } catch (error) {
    return handleError(response, error, 'Server error getting stores')
  }
}

module.exports = { getTiendas }