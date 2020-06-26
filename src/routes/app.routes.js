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

  app.get(
    "/api/production/cutting/get-id",
    [
    authJwt.verifyToken
    ],
    controller.generateCuttingId
  );

  app.get(
    "/api/production/cutting/get-data",
    [
    authJwt.verifyToken
    ],
    controller.getCuttingData
  );

  app.post(
    "/api/production/cutting/process",
    [
      authJwt.verifyToken
    ],
    controller.processCutting
  );

  // Master item

  app.get(
    "/api/master-data/get-suppliers",
    [
    authJwt.verifyToken
    ],
    controller.getSuppliers
  );

  app.get(
    "/api/master-data/get-customers",
    [
    authJwt.verifyToken
    ],
    controller.getCustomers
  );

  app.get(
    "/api/master-data/get-measurement-units",
    [
    authJwt.verifyToken
    ],
    controller.getMeasurementUnits
  );

  app.get(
    "/api/master-data/get-items",
    [
    authJwt.verifyToken
    ],
    controller.getItems
  );

  app.get(
    "/api/master-data/get-expenses",
    [
    authJwt.verifyToken
    ],
    controller.getExpenses
  );

  app.post(
    "/api/master-data/add-supplier",
    [
      authJwt.verifyToken
    ],
    controller.addSupplier
  );

  app.post(
    "/api/master-data/add-customer",
    [
      authJwt.verifyToken
    ],
    controller.addCustomer
  );

  app.post(
    "/api/master-data/add-measurement-unit",
    [
      authJwt.verifyToken
    ],
    controller.addMeasurementUnit
  );

  app.post(
    "/api/master-data/add-item",
    [
      authJwt.verifyToken
    ],
    controller.addItem
  );

  app.post(
    "/api/master-data/add-expense",
    [
      authJwt.verifyToken
    ],
    controller.addExpense
  );

  // Storage
  app.get(
    "/api/storage/get-fresh-items",
    [
      authJwt.verifyToken
    ],
    controller.getFreshItemStorage
  );

  app.get(
    "/api/storage/get-frozen-items",
    [
      authJwt.verifyToken
    ],
    controller.getFrozenItemStorage
  );
};