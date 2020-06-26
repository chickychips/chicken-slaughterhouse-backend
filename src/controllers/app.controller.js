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

  db.transaction(trx => {
    trx.insert({
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
    .then(result => {
      return trx('warehouse_fresh')
      .update({ 
        quantity_weight: knex.raw('?? + ??', ['quantity_weight', parseInt(quantityWeight)]),
        quantity_volume: knex.raw('?? + ??', ['quantity_volume', parseInt(quantityVolume)]),
      })
      .where('item_name', '=', itemName)
      .then(result => {
        res.status(200).send({ 
          "message": "Purchase data succesfully posted",
        });
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
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


exports.generateCuttingId = (req, res) => {
  console.log('generateCuttingId/ incoming')
 return db.from('cutting_history')
    .max('id', {as: 'latest_id'})
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
        latestIdMonth = data.latest_id.substring(9, 11);
        
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

      newId = 'CUT-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Master Data

exports.getSuppliers = (req, res) => {
  console.log('getSuppliers/ incoming');
  return db.select('*').from('supplier')
    .orderBy('id', 'asc')
    .then(data => {
      res.status(200).json({ suppliers: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getCustomers = (req, res) => {
  console.log('getCustomers/ incoming');
  return db.select('*').from('customer')
    .orderBy('id', 'asc')
    .then(data => {
      res.status(200).json({ customers: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getMeasurementUnits = (req, res) => {
  console.log('getMeasurementUnits/ incoming');
  return db.select('*').from('measurement_unit')
    .orderBy('id', 'asc')
    .then(data => {
      res.status(200).json({ measurementUnits: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getItems = (req, res) => {
  console.log('getItems/ incoming');
  return db.select('master_item.*', 'item_type.group', 'item_type.type').from('master_item')
    .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .orderBy('master_item.item_type_id', 'asc')
    .then(data => {
      res.status(200).json({ items: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getExpenses = (req, res) => {
  console.log('getExpenses/ incoming');
  return db.select('master_cost.*', 'measurement_unit.name AS measurement_unit_name').from('master_cost')
    .innerJoin('measurement_unit', 'master_cost.measurement_unit_id', '=', 'measurement_unit.id')
    .orderBy('id', 'asc')
    .then(data => {
      res.status(200).json({ expenses: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.addSupplier = (req, res) => {
  console.log('addSupplier/ incoming')
  const {
   name, address, description, createdBy
  } = req.body;

  return db.insert({
    name,
    address,
    description,
    created_by: createdBy
  })
  .into('supplier')
  .then(result => {
      res.status(200).send({ 
        "message": "success",
      });
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  }); 
};

exports.addCustomer = (req, res) => {
  console.log('addCustomer/ incoming')
  const {
   name, address, description, createdBy
  } = req.body;

  return db.insert({
    name,
    address,
    description,
    created_by: createdBy
  })
  .into('customer')
  .then(result => {
      res.status(200).send({ 
        "message": "success",
      });
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  }); 
};

exports.addMeasurementUnit = (req, res) => {
  console.log('addMeasurementUnit/ incoming')
  const {
   name, description, createdBy
  } = req.body;

  return db.insert({
    name,
    description,
    created_by: createdBy
  })
  .into('measurement_unit')
  .then(result => {
      res.status(200).send({ 
        "message": "success",
      });
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  }); 
};

exports.addItem = (req, res) => {
  console.log('addItem/ incoming')
  const {
   name, description, itemType, itemOutputType, createdBy
  } = req.body;

  db.select('id')
  .from('item_type')
  .where('group', '=', itemType)
  .andWhere('type', '=', itemOutputType)
  .first()
  .then(result => {
    console.log(result);
    console.log(result.id);
    return db.insert({
      name,
      description,
      item_type_id: result.id,
      created_by: createdBy
    })
    .into('master_item')
    .then(result => {
        res.status(200).send({ 
          "message": "success",
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    }); 
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  }); 
};

exports.addExpense = (req, res) => {
  console.log('addExpense/ incoming')
  const {
   name, measurementUnitId, description, createdBy
  } = req.body;

  return db.insert({
    name,
    measurement_unit_id: measurementUnitId,
    description,
    created_by: createdBy
  })
  .into('master_cost')
  .then(result => {
      res.status(200).send({ 
        "message": "success",
      });
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  }); 
};

// Production/cutting
exports.getCuttingData = (req, res) => {
  console.log('getUnprocessedSupplyt/ incoming');
  var padMonth = "00";
  var currentTime = new Date();
  var month = '' + (currentTime.getMonth() + 1);
  var monthPadded = padMonth.substring(month.length) + month;
  var currentTimeDateOnly = '' + currentTime.getFullYear() + '-' + monthPadded + '-' + currentTime.getDate() ;

  return db.select('production_id', 'item_name', 'quantity_weight', 'quantity_volume').from('production_supply')
    .where('is_processed', '=', 'false')
    .andWhere('created_on', '>=', currentTimeDateOnly)
    .then(supplyList => {
      db('master_item').select('master_item.name', 'item_type.is_input', 'item_type.group')
      .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
      .then(itemList => {
        db('warehouse_fresh').select('warehouse_fresh.item_name', 'warehouse_fresh.quantity_weight', 'warehouse_fresh.quantity_volume', 'item_type.group')
        .innerJoin('master_item', 'warehouse_fresh.item_name', '=', 'master_item.name')
        .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
        .then(stockList => {
          res.status(200).json({ 
            supplyList: supplyList,
            itemList: itemList,
            stockList: stockList, 
          });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        })
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};


exports.processCutting = (req, res) => {
  console.log('processCutting/ incoming')

  const {
    cuttingId, itemInput, itemOutput, inputQuantityWeight, inputQuantityVolume, referenceId, createdBy
  } = req.body;

  console.log(itemOutput);
  var isInput = true;

  return db.transaction(async (trx) => {
    await trx('cutting_history')
      .insert({
        id: cuttingId,
        item_input: itemInput,
        item_output: itemOutput,
        created_by: createdBy,
      })

    if( referenceId !== "")
    {
      await trx('production_supply')
        .update({ 
          is_processed: "true",
        })
        .where('production_id', '=', referenceId)
    }

    await trx('warehouse_fresh')
      .update({ 
        quantity_weight: trx.raw('?? - ??', ['quantity_weight', parseInt(inputQuantityWeight)]),
        quantity_volume: trx.raw('?? - ??', ['quantity_volume', parseInt(inputQuantityVolume)]),
      })
      .where('item_name', '=', itemInput)

    for (let index of Object.keys(itemOutput)) {
      let itemName = itemOutput[index].name;
      let quantityWeight = itemOutput[index].quantityWeight;
      let quantityVolume = itemOutput[index].quantityVolume;

      await trx('warehouse_fresh_history')
        .insert({
          reference_id: cuttingId,
          item_name: itemName,
          quantity_weight: quantityWeight,
          quantity_volume: quantityVolume,
          is_input: isInput,
          input_source: 'cutting',
          created_by: createdBy,
        })

      await trx('warehouse_fresh')
        .update({ 
          quantity_weight: knex.raw('?? + ??', ['quantity_weight', parseInt(quantityWeight)]),
          quantity_volume: knex.raw('?? + ??', ['quantity_volume', parseInt(quantityVolume)]),
        })
        .where('item_name', '=', itemName)

    }
  })
  .then(result => {
    res.status(200).send({ message: 'ok' });
  })       
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};