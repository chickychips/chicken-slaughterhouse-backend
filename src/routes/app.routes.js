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
    "/api/production/cutting/generate-id",
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

  // Transaction
  app.get(
    "/api/transaction/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateSalesOrderId
  );

  app.get(
    "/api/transaction/get-transaction-data",
    [
      authJwt.verifyToken
    ],
    controller.getTransactionData
  );

  app.post(
    "/api/transaction/get-transaction-history",
    [
      authJwt.verifyToken
    ],
    controller.getTransactionHistory
  );

  app.post(
    "/api/transaction/get-transaction-detail",
    [
      authJwt.verifyToken
    ],
    controller.getTransactionDetail
  );

  app.post(
    "/api/transaction/add-transaction",
    [
      authJwt.verifyToken
    ],
    controller.addTransaction
  );

  // Storage item delivery
  app.post(
    "/api/storage/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateDeliveryId
  );

  app.post(
    "/api/storage/get-pending-transaction",
    [
      authJwt.verifyToken
    ],
    controller.getPendingTransaction
  );

  app.post(
    "/api/storage/deliver-item",
    [
      authJwt.verifyToken
    ],
    controller.deliverItem
  );

// Production / Thawing
  app.get(
    "/api/production/thawing/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateThawingId
  );

  app.get(
    "/api/production/thawing/get-data",
    [
      authJwt.verifyToken
    ],
    controller.getThawingData
  );

  app.post(
    "/api/production/thawing/process",
    [
      authJwt.verifyToken
    ],
    controller.processThawing
  );
// Production / Freeze
  app.get(
    "/api/production/freeze/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateFreezeId
  );

  app.get(
    "/api/production/freeze/get-data",
    [
      authJwt.verifyToken
    ],
    controller.getFreezeData
  );

  app.post(
    "/api/production/freeze/process",
    [
      authJwt.verifyToken
    ],
    controller.processFreeze
  );

// Production / Expense
  app.get(
    "/api/production/expense/generate-id",
    [
      authJwt.verifyToken
    ],
    controller.generateExpenseId
  );

  app.get(
    "/api/production/expense/get-data",
    [
      authJwt.verifyToken
    ],
    controller.getExpenseData
  );

  app.post(
    "/api/production/expense/add",
    [
      authJwt.verifyToken
    ],
    controller.addExpenseData
  );

};