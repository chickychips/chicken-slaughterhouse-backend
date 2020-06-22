const db = require("../models");
const config = require("../config/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require('bcrypt-nodejs');

exports.register = (req, res) => {
  console.log('register/ incoming request', req.body);
  // Save User to Database
  const { username, name, phone, address, password, roleId, createdBy } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        username: username,
      })
      .into('users_auth')
      .returning('username')
      .then(loginUsername => {
        return trx('users')
        .returning('*')
        .insert({
          username: loginUsername[0],
          name: name,
          phone: phone,
          address: address,
          role_id: roleId,
          created_by: createdBy
        })
        .then(user => {
          res.json({ message: "User was registered successfully!" });
        })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });
};

exports.account = (req, res) => {
  console.log('account/ incoming request', req.userId);
  return db.select([
      'users.id',
      'users.username',
      'users.name',
      'users.phone',
      'users_role.role_name'
    ])
    .from('users')
    .innerJoin('users_role', 'users.role_id', '=', 'users_role.id')
    .where('users.id', '=', req.userId)
    .then(userData => {
      res.status(200).send({
        id: userData[0].id,
        username: userData[0].username,
        name: userData[0].name,
        phone: userData[0].phone,
        role: userData[0].role_name
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
}

exports.signin = (req, res) => {
  console.log('sign in/ incoming request', req.body);
  db.select('username', 'hash').from('users_auth')
    .where('username', '=', req.body.username)
    .then(user => {
      if (!user[0]) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid username or password!"
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user[0].hash
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid username or password!"
        });
      }

      db.select([
          'users.id',
          'users.username',
          'users.name',
          'users.phone',
          'users_role.role_name'
        ])
        .from('users')
        .innerJoin('users_role', 'users.role_id', '=', 'users_role.id')
        .where('username', '=', req.body.username)
        .then(userData => {
          
          var token = jwt.sign({ id: userData[0].id }, config.secret, {
            expiresIn: config.expiresIn
          });

          res.status(200).send({
            id: userData[0].id,
            username: userData[0].username,
            name: userData[0].name,
            phone: userData[0].phone,
            role: userData[0].role_name,
            accessToken: token
          });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
