const config = require("../config/db.config.js");
const knex = require('knex');

var types = require('pg').types;

// override parsing date column to timestamp
types.setTypeParser(1114, val => val); 
// var moment = require('moment'); // require
// types.setTypeParser(1114, str => moment.utc(str).format());
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; 

// const db = knex({
//   client: config.client,
//   connection: {
//     host: config.host,
//     user: config.user,
//     password: config.password,
//     database: config.database
//   }
// });
const db = knex({
  client: config.client,
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

module.exports = db;
