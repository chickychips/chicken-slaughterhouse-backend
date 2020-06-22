const { authJwt } = require("../middlewares");
const controller = require("../controllers/app.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/purchase-order/history",
    [
      authJwt.verifyToken
    ],
    controller.getOrderHistory
  );

  app.get(
    "/api/purchase-order/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateProductionId
  );

  app.post(
    "/api/purchase-order/create",
    [
      authJwt.verifyToken
    ],
    controller.purchaseOrder
  );

  app.get(
    "/api/params/items",
    [
      authJwt.verifyToken
    ],
    controller.getItemList
  );

  app.get(
    "/api/params/suppliers",
    [
      authJwt.verifyToken
    ],
    controller.getSupplierList
  );
  
};