const { verifyRegister, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/register",
    [
      authJwt.verifyToken,
      verifyRegister.checkDuplicateUsername
    ],
    controller.register
  );

  app.get(
    "/api/auth/account",
    [
      authJwt.verifyToken
    ],
    controller.account
  );
  
  app.post("/api/auth/signin", controller.signin);
};