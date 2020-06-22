const db = require("../models");

exports.getOrderHistory = (req, res) => {
  console.log('getOrderHistory/ incoming')
 return db.select('*').from('production_supply')
    .orderBy('production_id', 'desc')
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.generateProductionId = (req, res) => {
  console.log('generateProductionId/ incoming')
 return db.from('production_supply')
    .max('production_id', {as: 'latest_id'})
    .first()
    .then(data => {
      var nextRunningNumber = parseInt(data.latest_id.substring(data.latest_id.length-3, data.latest_id.length)) + 1;
      
      nextRunningNumber = nextRunningNumber > 999 ? 1 : nextRunningNumber;
      nextRunningNumber = '' + nextRunningNumber;
      var padChar = "000";

      var newId = data.latest_id.substring(0, data.latest_id.length-3) + padChar.substring(nextRunningNumber.length) + nextRunningNumber;
      
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.purchaseOrder = (req, res) => {
  console.log('purchaseOrder/ incoming')
  const {
   productionId, supplierName, itemName, quantityWeight, quantityVolume,
   unitPrice, totalPrice, createdBy
  } = req.body;

  db.insert({
   production_id: productionId,
   supplier_name: supplierName,
   item_name: itemName,
   quantity_weight: quantityWeight,
   quantity_volume: quantityVolume,
   unit_price: unitPrice,
   total_price: totalPrice,
   created_by: createdBy
  })
    .into('production_supply')
    .returning('production_id')
    .then(data => {
      res.status(200).send({ 
        "message": "Purchase data succesfully posted",
        "production_id": data[0]
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};