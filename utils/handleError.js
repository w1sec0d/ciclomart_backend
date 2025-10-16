// Helper function to handle errors consistently
const handleError = (res, error, message) => {
    console.error(message, error)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
    })
}

module.exports = handleError