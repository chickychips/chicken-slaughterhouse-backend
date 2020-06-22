const db = require("../models");
const knex = require('knex');


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
      var padMonth = "00";
      var currentTime = new Date();
      var year = '' + currentTime.getFullYear();
      var month = '' + (currentTime.getMonth() + 1);
      var monthPadded = padMonth.substring(month.length) + month;
      var latestIdMonth = '';

      var nextRunningNumberPadded = '';
      var newId = '';
      if(!data.latest_id){
        nextRunningNumberPadded = '001';
      }
      else{
        var nextRunningNumber = parseInt(data.latest_id.substring(data.latest_id.length-3, data.latest_id.length)) + 1;
        latestIdMonth = data.latest_id.substring(5, 7);
        
        if(monthPadded === latestIdMonth){
          nextRunningNumber = nextRunningNumber > 999 ? 1 : nextRunningNumber;
          nextRunningNumber = '' + nextRunningNumber;   
        }
        else {
          nextRunningNumber = '1';
        }
        var padChar = "000";

        nextRunningNumberPadded = padChar.substring(nextRunningNumber.length) + nextRunningNumber;
      }

      newId = year + '-' + monthPadded + '-' + nextRunningNumberPadded;
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

// Params
exports.getItemList = (req, res) => {
  console.log('getItemList/ incoming');
  return db.select('master_item.name').from('master_item')
    .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .where('item_type.is_input', '=', 'true')
    .andWhere('item_type.group', '=', 'alive')
    .then(data => {
      res.status(200).json({ items: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getSupplierList = (req, res) => {
  console.log('getSupplierList/ incoming');
  return db.select('name').from('supplier')
    .then(data => {
      res.status(200).json({ suppliers: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};