const config = require("../config/db.config.js");
const knex = require('knex');

var types = require('pg').types;

// override parsing date column to timestamp
types.setTypeParser(1114, val => val); 
// var moment = require('moment'); // require
// types.setTypeParser(1114, str => moment.utc(str).format());


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
