const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const db = require("./models");

const app = express();

// var corsOptions = {
//   origin: "http://192.168.1.101:3000"
//   // origin: "http://localhost:3000"
// };

// app.configure(function () {
//     app.use(express.methodOverride());
//     app.use(express.bodyParser());
//     app.use(function(req, res, next) {
//       res.header("Access-Control-Allow-Origin", "*");
//       res.header("Access-Control-Allow-Headers", "X-Requested-With");
//       next();
//     });
//     app.use(app.router);
// });

app.use(express.json());
app.use(cors());

require('./routes/auth.routes')(app);
require('./routes/app.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});