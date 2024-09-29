const express = require("express");
const { getDb } = require("../db/client");

const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const login_router = express.Router();


login_router.use(express.json())
login_router.use(express.urlencoded({ extended : true }))
login_router.use(cookieParser())


login_router.post("/password", async (req, res) => {


	try {

		const {username, password} = req.body;


		let users = getDb().collection("users");


		let user = await users.findOne({
			username, password
		})		


		if(user){
	
			let session = crypto.randomUUID();


			await users.updateOne({username, password}, {
				$set : {session}
			}, {
				upsert : true
			})
			

			res.cookie("session", session)
			res.send({sucess : true})
		}else {
			res.send({error : "username or password wrong"})
		}	
	
	}catch(e){
		res.send(e)
	}

}) 

login_router.post("/session", async (req, res) => {

	try {
		const { session } = req.cookies;

		let users = getDb().collection("users")
		
		let user = await users.findOne({session})

		if(user){
			return res.send({success : true})
		}else {
			res.send({error : "no such session registered"})
		}


	}catch(e){
		res.send({error : "some error"})
	}


})


module.exports = {
	login_router
}
