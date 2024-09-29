const { MongoClient } = require("mongodb");
const { p } = require("../p");

let db;

const getDb = () => {

	return db;
}


async function runWithDb(cb){


	let client = new MongoClient(p().MONGO)

	try {
		await client.connect();


	db = client.db("localhost");
	

	cb()}catch(e){
		console.log(e)

		await client.close()
	}	
}

module.exports = {
	getDb, 
	runWithDb
}
