const db = require("../models");

// Dashboard
exports.getDashboardData = (req, res) => {
  console.log('getDashboardData/ incoming')

  const currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const firstDayOfCurrentYear = new Date(new Date().getFullYear(), 1, 1);

  db.select(
              db.raw('to_char(created_on, \'Mon\') as month'),
              db.raw('sum(total_price) as total_price')
            )
    .from('transaction')
    .where('created_on', '>=', firstDayOfCurrentYear)
    .groupBy('month')
    .then(yearToDateTransactionSum => {
      db('transaction').sum('total_price as total_price')
        .where('created_on', '>=', currentDate)
        .then(todayTransactionSum => {
          db('production_supply').select (
              db.raw('to_char(created_on, \'Mon\') as month'),
              db.raw('sum(total_price) as total_price')
            )
            .where('created_on', '>=', firstDayOfCurrentYear)
            .groupBy('month')
            .then(yearToDatePurchaseSum => {
              db('production_supply').sum('total_price as total_price')
                .where('created_on', '>=', currentDate)
                .then(todayPurchaseSum => {
                  db('transaction').select(
                    'customer',
                    db.raw('sum(total_price) as total_price')
                    )
                    .where('created_on', '>=', firstDayOfCurrentYear)
                    .groupBy('customer')
                    .limit(5)
                    .then(top5Customer => {
                      db('transaction').select(
                        'created_by',
                        db.raw('sum(total_price) as total_price')
                        )
                        .where('created_on', '>=', firstDayOfCurrentYear)
                        .groupBy('created_by')
                        .limit(5)
                        .then(top5Sales => {
                          db('transaction_detail').select(
                            'item_name',
                            db.raw('sum(total_price) as total_price')
                            )
                            .where('created_on', '>=', firstDayOfCurrentYear)
                            .groupBy('item_name')
                            .limit(5)
                            .then(top5ItemSold => {
                              return db('production_supply').select(
                                'supplier_name',
                                db.raw('sum(total_price) as total_price')
                                )
                                .where('created_on', '>=', firstDayOfCurrentYear)
                                .groupBy('supplier_name')
                                .limit(5)
                                .then(top5Supplier => {
                                  res.status(200).send({ 
                                    yearToDateTransactionSum,
                                    yearToDatePurchaseSum,
                                    todayTransactionSum,
                                    todayPurchaseSum,
                                    top5Customer,
                                    top5Sales,
                                    top5ItemSold, 
                                    top5Supplier,
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
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
