const http = require("http");


const express = require("express");

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended : true }))

app.use(express.static(__dirname + "/static/"))

const { runWithDb } = require("./db/client");
const { login_router } = require("./api/login");
const { relay_router } = require("./relay/relay");
const { attach_wss } = require("./ws/relay_websocket");

let server = http.createServer(app);


attach_wss(server)

const PORT = process.env.PORT || 3000


app.use("/login", login_router)
app.use("/", relay_router)


runWithDb(() => {
	server.listen(PORT, () => console.log("app runs on port: ", PORT))
})

