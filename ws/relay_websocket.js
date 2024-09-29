const { WebSocketServer } = require("ws");
const crypto = require("crypto")

const { getDb } = require("../db/client")

//servers is the thing running and deploying the docker containers
const connected_servers = new Map()

//hosts is the containers themselves
const connected_hosts = new Map()

const connected_clients = new Map();

const stalled_requests = new Map();


function attach_wss(server){

	let wss = new WebSocketServer({ server });




	wss.on("connection", (socket, req) => {

		
		let host = req.url.split("/")[1]
		

		if(host.length != 0){

			let client_id = crypto.randomUUID();

			while(connected_clients.has(client_id)){
				client_id = crypto.randomUUID();
			}

			socket.host_id = host


			socket.client_id = client_id;

			connected_clients.set(client_id, socket)
		}


		socket.on("message", async proto => {


			//methods for ws host login and relaying none of this actually interests the end user	
			if(host.length == 0){
		

				try {

				let msg = JSON.parse(proto.toString());


				if(msg.type == "server.login"){
					let { server_id, server_password } = msg

				
					let registered_hosts = getDb().collection("servers");


					let server = await registered_hosts.findOne({server_id, server_password});


					if(!server){
						return socket.send(JSON.stringify({
							error : "no registered server with this servername and password"
						}))
					}
					socket.server_id = server_id

					connected_servers.set(server_id, socket)
				}	

				//i think this works now? 

				if(msg.type == "server.update.hosts"){

					let { old_list, new_list } = msg;	
						

					old_list.forEach(host => {
						connected_hosts.delete(host)
					})

					new_list.forEach(host => {
						connected_hosts.set(host, socket)
					})

				}

				if(msg.type == "server.rest.response"){

					if(!socket.server_id){
						return ws.send(JSON.stringify({
							error : "you are not a connected host"
						}))
					}	

					let { response, stalled_request_id } = msg;



					let stalled_request = stalled_requests.get(stalled_request_id);



					stalled_request.statusMessage = response.statusText ? response.statusText : ""
					stalled_request.status(response.status ? response.status : 404)
					stalled_request.set(response.headers ? response.headers : {})
					stalled_request.send(response.body ? response.body : "404")

				}				

				if(msg.type == "server.ws.message"){
					if(!socket.server_id){
						return socket.send(JSON.stringify({
							error : "you are not a connected host"
						}))
					}

					let { message, client_id } = msg;
					
					let client = connected_clients.get(client_id);


					client.send(message)
				}
				}
				catch(e){
					console.log("invalid access", e)
				}

				return 			
			}
			


			try {


				let host = connected_hosts.get(socket.host_id);
				

				host.send(JSON.stringify({
					type : "client.ws.message",
					sender : socket.client_id,
					host : socket.host_id,
					data : proto
				}))
			}catch(e){
				console.log(e)
				socket.send(JSON.stringify({
					error : "this host seems to be offline"
				}))
			}


			//relaying layer
		
			


				


		})
	
	})

}

module.exports = {
	attach_wss,
	connected_hosts,
	stalled_requests
}
