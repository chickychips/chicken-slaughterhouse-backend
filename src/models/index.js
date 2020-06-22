const config = require("../config/db.config.js");
const knex = require('knex');

const db = knex({
  client: config.client,
  connection: {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  }
});

module.exports = db;
