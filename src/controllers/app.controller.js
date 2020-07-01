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
  return db.select('master_cost.*', 'measurement_unit.name as measurement_unit_name').from('master_cost')
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
  let {
   name, description, itemType, itemOutputType, createdBy
  } = req.body;

  name = name.toUpperCase(); 
  description = description.toUpperCase();
  console.log(req.body);

  console.log(name);
  console.log(description);
  // return res.status(500).send('error');
  db.transaction(trx => {
    trx.select('id')
    .from('item_type')
    .where('group', '=', itemType)
    .andWhere('type', '=', itemOutputType)
    .first()
    .then(result => {
      trx.insert({
        name,
        description,
        item_type_id: result.id,
        created_by: createdBy
      })
      .into('master_item')
      .then(result => {
        trx.insert({
          item_name: name,
          quantity_weight: 0,
          quantity_volume: 0
        })
        .into('warehouse_fresh')
        .then(result => {
          trx.insert({
            item_name: name,
            quantity_weight: 0,
            quantity_volume: 0
          })
          .into('warehouse_frozen')
          .then(result => {
            res.status(200).send({ 
              "message": "success",
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

// Storage
exports.getFreshItemStorage = (req, res) => {
  console.log('getFreshItemStorage/ incoming');
  return db.select('warehouse_fresh.*', 'item_type.group', 'item_type.type')
    .from('warehouse_fresh')
    .innerJoin('master_item', 'warehouse_fresh.item_name', '=', 'master_item.name')
    .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .orderBy('master_item.item_type_id', 'asc')
    .then(data => {
      res.status(200).json({ items: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.getFrozenItemStorage = (req, res) => {
  console.log('getFrozenItemStorage/ incoming');
  return db.select('warehouse_frozen.*', 'item_type.group', 'item_type.type')
    .from('warehouse_frozen')
    .innerJoin('master_item', 'warehouse_frozen.item_name', '=', 'master_item.name')
    .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .where('item_type.group', '<>', 'alive')
    .orderBy('master_item.item_type_id', 'asc')
    .then(data => {
      res.status(200).json({ items: data });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

// Production/cutting

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

exports.getCuttingData = (req, res) => {
  console.log('getUnprocessedSupply/ incoming');
  var padMonth = "00";
  var currentTime = new Date();
  var month = '' + (currentTime.getMonth() + 1);
  var monthPadded = padMonth.substring(month.length) + month;
  var currentTimeDateOnly = '' + currentTime.getFullYear() + '-' + monthPadded + '-' + currentTime.getDate() ;

  return db.select('production_id', 'item_name', 'quantity_weight', 'quantity_volume').from('production_supply')
    .where('is_processed', '=', 'false')
    .andWhere('created_on', '>=', currentTimeDateOnly)
    .then(supplyList => {
      db('master_item').select('master_item.name', 'item_type.is_input', 'item_type.group', 'item_type.type')
      .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
      .then(itemList => {
        db('warehouse_fresh').select('warehouse_fresh.item_name', 'item_type.is_input', 'warehouse_fresh.quantity_weight',
                                      'warehouse_fresh.quantity_volume', 'item_type.group', 'item_type.type')
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

// Production/Thawing

exports.generateThawingId = (req, res) => {
  console.log('generateThawingId/ incoming')
 return db.from('thawing_history')
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

      newId = 'THW-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getThawingData = (req, res) => {
  console.log('getThawingData/ incoming');

  db.select('warehouse_frozen_history.*', 'transaction.customer', 'item_type.group', 'item_type.type')
    .from('warehouse_frozen_history')
    .join('master_item', 'warehouse_frozen_history.item_name', '=', 'master_item.name')
    .join('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .innerJoin('transaction', 'warehouse_frozen_history.reference_id', '=', 'transaction.id')
    .leftJoin('thawing_history', 'warehouse_frozen_history.reference_id', '=', 'thawing_history.ref_id')
    .where('warehouse_frozen_history.out_destination', '=', "thawing")
    .whereNull('thawing_history.ref_id')
    .then(thawingData => {
      // Get distinct pending transaction id
      let flags = [], pendingTransactionId = [], i;;
      for (i = 0; i < thawingData.length; i++){
        if(flags[thawingData[i].reference_id]) continue;

        flags[thawingData[i].reference_id] = true;
        pendingTransactionId.push(thawingData[i].reference_id);
      }  

      return db.select('warehouse_frozen.*', 'item_type.group', 'item_type.type')
        .from('warehouse_frozen')
        .join('master_item', 'warehouse_frozen.item_name', '=', 'master_item.name')
        .join('item_type', 'master_item.item_type_id', '=', 'item_type.id')
        .where('item_type.group', '<>', "alive")
        .andWhere('warehouse_frozen.quantity_weight', '>', 0)
        .andWhere('warehouse_frozen.quantity_volume', '>', 0)
        .then(stockFrozenData => {
          res.status(200).json({
            pendingTransactionId,
            thawingData,
            stockFrozenData,
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

exports.processThawing = (req, res) => {
  console.log('processThawing/ incoming')

  const {
    thawingId, referenceId, items, createdBy
  } = req.body;

  if(referenceId !== "")
  {
    return db('thawing_history')
      .insert({
        id: thawingId,
        ref_id: referenceId,
        items,
        created_by: createdBy,
      })
      .then(result => {
        res.status(200).send({ message: 'ok' });
      })       
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  }

  return db.transaction(async (trx) => {
    await trx('thawing_history')
      .insert({
        id: thawingId,
        ref_id: referenceId,
        items,
        created_by: createdBy,
      })

    for (let index of Object.keys(items)) {
      let itemName = items[index].item_name;
      let inputQuantityWeight = items[index].input_quantity_weight;
      let inputQuantityVolume = items[index].input_quantity_volume;
      let outputQuantityWeight = items[index].output_quantity_weight;
      let outputQuantityVolume = items[index].output_quantity_volume;

      await trx('warehouse_frozen_history')
        .insert({
          reference_id: thawingId,
          item_name: itemName,
          quantity_weight: inputQuantityWeight,
          quantity_volume: inputQuantityVolume,
          is_input: "false",
          out_destination: "fresh",
          created_by: createdBy,
        })

      await trx('warehouse_fresh_history')
        .insert({
          reference_id: thawingId,
          item_name: itemName,
          quantity_weight: outputQuantityWeight,
          quantity_volume: outputQuantityVolume,
          is_input: "true",
          input_source: "frozen",
          created_by: createdBy,
        })

      await trx('warehouse_frozen')
        .update({ 
          quantity_weight: trx.raw('?? - ??', ['quantity_weight', parseInt(inputQuantityWeight)]),
          quantity_volume: trx.raw('?? - ??', ['quantity_volume', parseInt(inputQuantityVolume)]),
        })
        .where('item_name', '=', itemName)

      await trx('warehouse_fresh')
        .update({ 
          quantity_weight: knex.raw('?? + ??', ['quantity_weight', parseInt(outputQuantityWeight)]),
          quantity_volume: knex.raw('?? + ??', ['quantity_volume', parseInt(outputQuantityVolume)]),
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

// Production/Freeze

exports.generateFreezeId = (req, res) => {
  console.log('generateFrozenId/ incoming')
 return db.from('freeze_history')
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

      newId = 'FRZ-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getFreezeData = (req, res) => {
  console.log('getFreezeData/ incoming');

  return db.select('warehouse_fresh.*', 'item_type.group', 'item_type.type')
    .from('warehouse_fresh')
    .join('master_item', 'warehouse_fresh.item_name', '=', 'master_item.name')
    .join('item_type', 'master_item.item_type_id', '=', 'item_type.id')
    .where('item_type.group', '<>', "alive")
    .andWhere('warehouse_fresh.quantity_weight', '>', 0)
    .andWhere('warehouse_fresh.quantity_volume', '>', 0)
    .then(freezeData => {
      res.status(200).json({
        freezeData,
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.processFreeze = (req, res) => {
  console.log('processFreeze/ incoming')

  const {
    freezeId, items, createdBy
  } = req.body;

  var isInput = true;

  return db.transaction(async (trx) => {
    await trx('freeze_history')
      .insert({
        id: freezeId,
        items,
        created_by: createdBy,
      })

    for (let index of Object.keys(items)) {
      let itemName = items[index].item_name;
      let inputQuantityWeight = items[index].input_quantity_weight;
      let inputQuantityVolume = items[index].input_quantity_volume;
      let outputQuantityWeight = items[index].output_quantity_weight;
      let outputQuantityVolume = items[index].output_quantity_volume;

      await trx('warehouse_fresh_history')
        .insert({
          reference_id: freezeId,
          item_name: itemName,
          quantity_weight: inputQuantityWeight,
          quantity_volume: inputQuantityVolume,
          is_input: "false",
          out_destination: "frozen",
          created_by: createdBy,
        })

      await trx('warehouse_frozen_history')
        .insert({
          reference_id: freezeId,
          item_name: itemName,
          quantity_weight: outputQuantityWeight,
          quantity_volume: outputQuantityVolume,
          is_input: isInput,
          input_source: "fresh",
          created_by: createdBy,
        })

      await trx('warehouse_fresh')
        .update({ 
          quantity_weight: trx.raw('?? - ??', ['quantity_weight', parseInt(inputQuantityWeight)]),
          quantity_volume: trx.raw('?? - ??', ['quantity_volume', parseInt(inputQuantityVolume)]),
        })
        .where('item_name', '=', itemName)

      await trx('warehouse_frozen')
        .update({ 
          quantity_weight: knex.raw('?? + ??', ['quantity_weight', parseInt(outputQuantityWeight)]),
          quantity_volume: knex.raw('?? + ??', ['quantity_volume', parseInt(outputQuantityVolume)]),
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


// Production/Expense

exports.generateExpenseId = (req, res) => {
  console.log('generateExpenseId/ incoming')
 return db.from('expense')
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

      newId = 'EXP-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getExpenseData = (req, res) => {
  console.log('getExpenseData/ incoming');

  return db.select('expense.*', 'measurement_unit.name as measurement_unit_name')
    .from('expense')
    .innerJoin('master_cost', 'expense.expense_name', '=', 'master_cost.name')
    .innerJoin('measurement_unit', 'master_cost.measurement_unit_id', '=', 'measurement_unit.id')
    .then(expense => {
      res.status(200).json({
        expense,
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.addExpenseData = (req, res) => {
  console.log('addExpense/ incoming')

  const {
    expenseId, expenseCutting, expenseFreeze, expenseThawing, createdBy
  } = req.body;

  var isInput = true;

  return db.transaction(async (trx) => {
    for (let index of Object.keys(expenseCutting)) {
      let expenseName = expenseCutting[index].expense_name;
      let quantity = expenseCutting[index].quantity;
      let unitAmount = expenseCutting[index].unit_amount;
      let totalAmount = expenseCutting[index].total_amount;
      await trx('expense')
        .insert({
          id: expenseId,
          expense_type: "cutting",
          expense_name: expenseName,
          quantity,
          unit_amount: unitAmount,
          total_amount: totalAmount,
          created_by: createdBy,
        })
    }

    for (let index of Object.keys(expenseFreeze)) {
      let expenseName = expenseFreeze[index].expense_name;
      let quantity = expenseFreeze[index].quantity;
      let unitAmount = expenseFreeze[index].unit_amount;
      let totalAmount = expenseFreeze[index].total_amount;
      await trx('expense')
        .insert({
          id: expenseId,
          expense_type: "freeze",
          expense_name: expenseName,
          quantity,
          unit_amount: unitAmount,
          total_amount: totalAmount,
          created_by: createdBy,
        })
    }

    for (let index of Object.keys(expenseThawing)) {
      let expenseName = expenseThawing[index].expense_name;
      let quantity = expenseThawing[index].quantity;
      let unitAmount = expenseThawing[index].unit_amount;
      let totalAmount = expenseThawing[index].total_amount;
      await trx('expense')
        .insert({
          id: expenseId,
          expense_type: "thawing",
          expense_name: expenseName,
          quantity,
          unit_amount: unitAmount,
          total_amount: totalAmount,
          created_by: createdBy,
        })
    }
  })
  .then(result => {
    res.status(200).send({ message: 'ok' });
  })       
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};

// Transaction

exports.generateSalesOrderId = (req, res) => {
  console.log('generateSalesOrderId/ incoming')
 return db.from('transaction')
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

      newId = 'INV-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getTransactionData = (req, res) => {
  console.log('getTransactionData/ incoming');

  return db.select('name').from('customer')
    .orderBy('id', 'asc')
    .then(customerList => {
      db('warehouse_fresh').select('warehouse_fresh.item_name', 'warehouse_fresh.quantity_weight',
                                    'warehouse_fresh.quantity_volume', 'item_type.group', 'item_type.type')
      .innerJoin('master_item', 'warehouse_fresh.item_name', '=', 'master_item.name')
      .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
      .where('quantity_weight', '>', 0)
      .andWhere('quantity_volume', '>', 0)
      .andWhere('item_type.group', '<>', 'alive')
      .then(stockFresh => {
        db('warehouse_frozen').select('warehouse_frozen.item_name', 'warehouse_frozen.quantity_weight',
                                    'warehouse_frozen.quantity_volume', 'item_type.group', 'item_type.type')
        .innerJoin('master_item', 'warehouse_frozen.item_name', '=', 'master_item.name')
        .innerJoin('item_type', 'master_item.item_type_id', '=', 'item_type.id')
        .where('quantity_weight', '>', 0)
        .andWhere('quantity_volume', '>', 0)
        .then(stockFrozen => {
          res.status(200).json({ 
            customerList,
            stockFresh,
            stockFrozen,
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

exports.getTransactionHistory = (req, res) => {
  console.log('getTransactionHistory/ incoming');
  const { createdBy } = req.body;

  return db.select('transaction.*', 'transaction_status.name as status_name')
    .from('transaction')
    .innerJoin('transaction_status', 'transaction.status', '=', 'transaction_status.id')
    .where('transaction.created_by', '=', createdBy)
    .then(transactionHistory => {
      res.status(200).json({ 
        transactionHistory,
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    }) 
}

exports.getTransactionDetail = (req, res) => {
  console.log('getTransactionDetail/ incoming');
  const { id } = req.body

  return db.select('*')
    .from('transaction_detail')
    .where('ref_id' ,'=', id)
    .then(transactionDetail => {
      res.status(200).json({
        transactionDetail
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
}

exports.addTransaction = (req, res) => {
  console.log('addTransaction/ incoming')

  console.log(req.body);
  const {
    id, customer, totalQuantityWeight, totalQuantityVolume, totalPrice, totalDiscount, items, createdBy
  } = req.body;

  return db.transaction(async (trx) => {
    await trx('transaction')
      .insert({
        id,
        customer,
        total_quantity_weight: totalQuantityWeight,
        total_quantity_volume: totalQuantityVolume,
        total_price: totalPrice,
        status: 1, // Pending
        discount: totalDiscount,
        remarks: "",
        created_by: createdBy,
      })

    for (let index of Object.keys(items)) {
      let itemName = items[index].name;
      let quantityWeight = items[index].quantityWeight;
      let quantityVolume = items[index].quantityVolume;
      let isFrozen = items[index].isFrozen;
      let isThawed = items[index].isThawed;
      let unitPrice = items[index].unitPrice;
      let itemDiscount = items[index].discount;
      let itemTotalPrice = items[index].totalPrice;

      await trx('transaction_detail')
        .insert({
          ref_id: id,
          item_name: itemName,
          is_frozen: isFrozen,
          is_thawed: isThawed,
          quantity_weight: quantityWeight,
          quantity_volume: quantityVolume,
          unit_price: unitPrice,
          discount: itemDiscount,
          total_price: itemTotalPrice,
          created_by: createdBy,
        })

      if (isFrozen === true)
      {
        await trx('warehouse_frozen')
          .update({ 
            quantity_weight: knex.raw('?? - ??', ['quantity_weight', parseInt(quantityWeight)]),
            quantity_volume: knex.raw('?? - ??', ['quantity_volume', parseInt(quantityVolume)]),
          })
          .where('item_name', '=', itemName) 
      }
      else
      {
        await trx('warehouse_fresh')
          .update({ 
            quantity_weight: knex.raw('?? - ??', ['quantity_weight', parseInt(quantityWeight)]),
            quantity_volume: knex.raw('?? - ??', ['quantity_volume', parseInt(quantityVolume)]),
          })
          .where('item_name', '=', itemName) 
      }
    }
  })
  .then(result => {
    res.status(200).send({ message: 'ok' });
  })       
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};

exports.generateDeliveryId = (req, res) => {
  console.log('generateDeliveryId/ incoming')
  const { storageSource } = req.body

 return db.from('delivery_order')
    .max('id', {as: 'latest_id'})
    .where('storage_source', '=', storageSource)
    .first()
    .then(data => {
      var padMonth = "00";
      var currentTime = new Date();
      var year = '' + currentTime.getFullYear();
      var month = '' + (currentTime.getMonth() + 1);
      var monthPadded = padMonth.substring(month.length) + month;
      var latestIdMonth = '';
      let warehouseCode = '';
      if(storageSource === 'fresh')
      {
        warehouseCode = 'A'
      }
      else
      {
        warehouseCode = 'B'
      }

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

      newId = 'SJ' + warehouseCode + '-' + year + '-' + monthPadded + '-' + nextRunningNumberPadded;
      res.status(200).send({newId: newId});
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getPendingTransaction = (req, res) => {
  console.log('getPendingTransaction/ incoming');
  const { storageSource } = req.body

  if ( storageSource === "fresh" )
  { 
    return db.select('transaction_detail.*', 'transaction.customer')
      .from('transaction_detail')
      .innerJoin('transaction', 'transaction_detail.ref_id', '=', 'transaction.id')
      .leftJoin('delivery_order', function() {
        this.on('transaction_detail.item_name', '=', 'delivery_order.item_name')
        .andOn('transaction_detail.is_frozen', '=', 'delivery_order.is_frozen')
        .andOn('transaction_detail.is_thawed', '=', 'delivery_order.is_thawed')
        .andOn('transaction_detail.ref_id', '=', 'delivery_order.transaction_id')
      })
      .whereNull('delivery_order.transaction_id')
      .andWhere('transaction.status', '=', 1)
      .andWhere('transaction_detail.is_frozen' ,'=', false)
      .then(pendingTransactionData => {
        db('transaction_detail')
        .select('transaction_detail.*', 'transaction.customer','thawing_history.id')
        .innerJoin('transaction', 'transaction_detail.ref_id', '=', 'transaction.id')
        .leftJoin('delivery_order', function() {
          this.on('transaction_detail.item_name', '=', 'delivery_order.item_name')
          .andOn('transaction_detail.is_frozen', '=', 'delivery_order.is_frozen')
          .andOn('transaction_detail.is_thawed', '=', 'delivery_order.is_thawed')
          .andOn('transaction_detail.ref_id', '=', 'delivery_order.transaction_id')
        })
        .leftJoin('thawing_history', 'transaction_detail.ref_id', '=', 'thawing_history.ref_id')
        .whereNull('delivery_order.transaction_id')
        // .whereNotNull('thawing_history.id')
        .andWhere('transaction.status', '=', 1)
        .andWhere('transaction_detail.is_frozen' ,'=', true)
        .andWhere('transaction_detail.is_thawed' ,'=', true)
        .then(pendingTransactionDataThawing => {
          console.log(pendingTransactionDataThawing);
          Array.prototype.push.apply(pendingTransactionData,pendingTransactionDataThawing); 
          
          // Get distinct pending transaction id
          let flags = [], pendingTransactionId = [], i;;
          for (i = 0; i < pendingTransactionData.length; i++){
            if(flags[pendingTransactionData[i].ref_id]) continue;
            flags[pendingTransactionData[i].ref_id] = true;
            pendingTransactionId.push(pendingTransactionData[i].ref_id);
          }  

          res.status(200).json({
            pendingTransactionId,
            pendingTransactionData,
          })
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        })
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      })
  }

  return db.select('transaction_detail.*', 'transaction.customer')
    .from('transaction_detail')
    .innerJoin('transaction', 'transaction_detail.ref_id', '=', 'transaction.id')
    .leftJoin('delivery_order', function() {
      this.on('transaction_detail.item_name', '=', 'delivery_order.item_name')
      .andOn('transaction_detail.is_frozen', '=', 'delivery_order.is_frozen')
      .andOn('transaction_detail.is_thawed', '=', 'delivery_order.is_thawed')
      .andOn('transaction_detail.ref_id', '=', 'delivery_order.transaction_id')
    })
    .whereNull('delivery_order.transaction_id')
    .andWhere('transaction.status', '=', 1)
    .andWhere('transaction_detail.is_frozen' ,'=', true)
    .then(pendingTransactionData => {
      // Get distinct pending transaction id
      let flags = [], pendingTransactionId = [], i;;
      for (i = 0; i < pendingTransactionData.length; i++){
        if(flags[pendingTransactionData[i].ref_id]) continue;
        flags[pendingTransactionData[i].ref_id] = true;
        pendingTransactionId.push(pendingTransactionData[i].ref_id);
      }  
      
      res.status(200).json({
        pendingTransactionId,
        pendingTransactionData,
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    })
};

exports.deliverItem = (req, res) => {
  console.log('deliverItem/ incoming')
  const {
   storageSource, id, transactionId, items, createdBy, 
  } = req.body;

  let thawingHistoryResult = [];

  if(storageSource === 'fresh')
  {
    const itemNeedThawing = items.filter(data => {
      return data.isThawed === true
    })

    return db.select('id')
      .from('thawing_history')
      .where('ref_id', '=', transactionId)
      .then(result => {
        // Check if there's an item that needs thawing but not in thawing history
        if(result.length === 0 && itemNeedThawing.length > 0)
        {
          res.status(403).send({ message: "Item belum di thawing" });
        }
        else
        {
          db.transaction(async (trx) => {
            for (let index of Object.keys(items)) {
              let itemName = items[index].name;
              let isFrozen = items[index].isFrozen;
              let isThawed = items[index].isThawed;
              let quantityWeight = items[index].quantityWeight;
              let quantityVolume = items[index].quantityVolume;

              await trx('delivery_order')
                .insert({
                  id,
                  storage_source: storageSource,
                  transaction_id: transactionId,
                  item_name: itemName,
                  is_frozen: isFrozen,
                  is_thawed: isThawed,
                  created_by: createdBy,
                })

              await trx('warehouse_fresh_history')
                .insert({
                  reference_id: transactionId,
                  item_name: itemName,
                  quantity_weight: quantityWeight,
                  quantity_volume: quantityVolume,
                  is_input: false,
                  out_destination: "buyer",
                  created_by: createdBy,
                })
            }
            await trx('transaction')
              .update({ 
                status: 2,
              })
              .whereIn(function() {
                  this.count('*')
                  .from('transaction_detail')
                  .leftJoin('delivery_order', function() {
                    this.on('transaction_detail.item_name', '=', 'delivery_order.item_name')
                    .andOn('transaction_detail.is_frozen', '=', 'delivery_order.is_frozen')
                    .andOn('transaction_detail.is_thawed', '=', 'delivery_order.is_thawed')
                    .andOn('transaction_detail.ref_id', '=', 'delivery_order.transaction_id')
                  })
                  .whereNull('delivery_order.transaction_id')
                  .andWhere('transaction_detail.ref_id', '=', transactionId)
                }, [0])
              .andWhere('id', '=', transactionId)
          })
          .then(result => {
            res.status(200).send({ message: 'ok' });
          })       
          .catch(err => {
            res.status(500).send({ message: err.message });
          });
        }
    })     
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
  }

  return db.transaction(async (trx) => {

    for (let index of Object.keys(items)) {
      let itemName = items[index].name;
      let isFrozen = items[index].isFrozen;
      let isThawed = items[index].isThawed;
      let quantityWeight = items[index].quantityWeight;
      let quantityVolume = items[index].quantityVolume;
      let outDestination = "buyer";

      if (isThawed === false)
      {
        // if items need thawing, dont insert into delivery order table
        await trx('delivery_order')
          .insert({
            id,
            storage_source: storageSource,
            transaction_id: transactionId,
            item_name: itemName,
            is_frozen: isFrozen,
            is_thawed: isThawed,
            created_by: createdBy,
          })
      }
      else
      {
        outDestination = "thawing";
      }

      await trx('warehouse_frozen_history')
        .insert({
          reference_id: transactionId,
          item_name: itemName,
          quantity_weight: quantityWeight,
          quantity_volume: quantityVolume,
          is_input: false,
          out_destination: outDestination,
          created_by: createdBy,
        })
    }
    await trx('transaction')
      .update({ 
        status: 2,
      })
      .whereIn(function() {
          this.count('*')
          .from('transaction_detail')
          .leftJoin('delivery_order', function() {
            this.on('transaction_detail.item_name', '=', 'delivery_order.item_name')
            .andOn('transaction_detail.is_frozen', '=', 'delivery_order.is_frozen')
            .andOn('transaction_detail.is_thawed', '=', 'delivery_order.is_thawed')
            .andOn('transaction_detail.ref_id', '=', 'delivery_order.transaction_id')
          })
          .whereNull('delivery_order.transaction_id')
          .andWhere('transaction_detail.ref_id', '=', transactionId)
          // .limit(1);
        }, [0])
      .andWhere('id', '=', transactionId)
  })
  .then(result => {
    res.status(200).send({ message: 'ok' });
  })       
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};