const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'postgres',
		database: 'DB_CHICKEN_SH'
	}
});

const app = express();

app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
	res.json(database.users);
})

app.post('/signin', (req, res) => {
	db.select('username', 'hash').from('users_auth')
		.where('username', '=', req.body.username)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
				.where('username', '=', req.body.username)
				.then(user => {
					res.json(user[0])
				})
				.catch(err => res.status(400).json('login error'))
			}
			else {
				res.status(400).json('wrong credentials');
			}
		})
		.catch(err => res.status(500).json('Unexpected error'))
		// .catch(err => console.log(err.message))
})

app.post('/register', (req, res) => {
	const { username, name, phone, address, password, roleId, createdBy } = req.body;
	const hash = bcrypt.hashSync(password);
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				username: username,
			})
			.into('users_auth')
			.returning('username')
			.then(loginUsername => {
				return trx('users')
				.returning('*')
				.insert({
					username: loginUsername[0],
					name: name,
					phone: phone,
					address: address,
					role_id: roleId,
					created_by: createdBy
				})
				.then(user => {
					res.json(user[0]);
				})
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		// .catch(err => console.log(err.message))
		.catch(err => res.status(500).json('Unexpected error'))
		// .catch(err => {
		// 	console.log(err.message); 
		// 	res.status(400).json({'email already exists'});
		// })
})

/*
	get supply
	method get
	return all from table
*/
app.get('/get-bought-supply', (req, res) => {
	return db.select('*').from('production_supply')
		.then(data => {
			res.json(data)
		})
		.catch(err => res.status(500).json('Unexpected error'))
})

/*
	buy supply
	method post
*/
app.post('/buy-supply', (req, res) => {
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
		res.json(data[0]);
	})
	.catch(err => res.status(500).json('Unexpected error'));
})

app.listen(3001, () => {
	console.log('app is running');
})

/*
	/signin --> POST
	/register --> POST = user
	/profile/:userId --> GET = user
	/image --> PUT --> user
*/