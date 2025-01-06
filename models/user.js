const db = require('../database/connection');

const User = {
  getAll: (callback) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  },
};

module.exports = User;
