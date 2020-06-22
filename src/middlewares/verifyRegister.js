const db = require("../models");

checkDuplicateUsername = (req, res, next) => {
  // Username
  db.select('id').from('users')
    .where('username', '=', req.body.username)
    .then(user => {
      if (user[0]) {
        res.status(400).send({
          message: "Username is already taken!"
        });
        return;
      }

      next();
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

const verifyRegister = {
  checkDuplicateUsername: checkDuplicateUsername
};

module.exports = verifyRegister;