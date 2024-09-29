const express = require("express");
const { decycle } = require("../helpers/helpers");
const crypto = require("crypto");
const { connected_hosts, stalled_requests } = require("../ws/relay_websocket");
const { getDb } = require("../db/client");
const cookieParser = require("cookie-parser");

const relay_router = express.Router();

relay_router.use(cookieParser())
relay_router.use(express.json())
relay_router.use(express.urlencoded())

relay_router.post("/deploy/:host_id", async (req, res) => {

	let { session } = req.cookies

	let user = await getDb().collection("users").findOne({session});

	if(!user){
		return res.send({
			error : "not logged in"
		})
	}

	try {
		let { repo }  = req.body

		console.log(req.body)

		let host = connected_hosts.get(req.params.host_id);

		if(!host){
			throw ""
		}



	let stalled_request_id = crypto.randomUUID();
	while(stalled_requests.has(stalled_request_id)){
		stalled_request_id = crypto.randomUUID();
	}

	stalled_requests.set(stalled_request_id, res)


		host.send(JSON.stringify({
			type : "client.deploy",
			repo,
			stalled_request_id
		}))

	}catch(e){
		res.send(e)
	}
})


relay_router.post("/logs/:host_id", async (req, res) => {

	 try {
		 let { session } = req.cookies


	let user = await getDb().collection("users").findOne({session});

	if(!user){
		return res.send({
			error : "not logged in"
		})
	}
	
	let host = connected_hosts.get(req.params.host_id)

	if(!host){
		return res.send({
			error : "no such host connected"
		})
	}


	let stalled_request_id = crypto.randomUUID();
	while(stalled_requests.has(stalled_request_id)){
		stalled_request_id = crypto.randomUUID();
	}

	stalled_requests.set(stalled_request_id, res)
	
	
	host.send(JSON.stringify({
		type : "client.showlogs",
		stalled_request_id,
		host : req.params.host_id
	}))
	}catch(e) {
		console.log(e)
		res.send(e)
	}
})

relay_router.use("/:host_id", (req, res) => {

	let host_id = req.params.host_id;		

	let host = connected_hosts.get(host_id);

	if(!host){
		return res.send({
			error : "no such host online at the time",
			tried_host_id : host_id
		})
	}

	let request_object = decycle(req);


	let stalled_request_id = crypto.randomUUID();
	while(stalled_requests.has(stalled_request_id)){
		stalled_request_id = crypto.randomUUID();
	}

	stalled_requests.set(stalled_request_id, res)

	host.send(JSON.stringify({
		type : "client.rest.request",
		host : host_id,
		request_object, 
		stalled_request_id
	}))

	return
})


module.exports = {
	relay_router
}
