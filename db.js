const { password, database } = require('pg/lib/defaults');

const Pool = require('pg').Pool;

const pool = new Pool({
	user: "postgres",
	password: "post",
	host: "localhost",
	port: 5432,
	database: "testdb",
})

module.exports = pool;
