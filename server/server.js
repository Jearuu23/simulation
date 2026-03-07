const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

function readData() {
	const data = fs.readFileSync("./messages.json", "utf8");
	return JSON.parse(data);
}

function writeData(data) {
	fs.writeFileSync("./messages.json", JSON.stringify(data));
}

app.get("/", (req, res) => {
	res.send("Hello World!");
});

// fetch messages
app.get("/message", (req, res) => {
	const messages = readData();
	res.send(messages);
});

// send message
app.post("/message", (req, res) => {
	const messages = readData();
	const newMessage = req.body;
	const message = {
		from: newMessage.from,
		text: newMessage.text,
		time: new Date().toISOString(),
	};
	messages.messages.push(message);
	console.log("message: ", message.from, message.text);

	writeData(messages);

	res.send(messages);
});

app.get("/intercept", (req, res) => {
	const packets = require(`./packets.json`);
	res.send(packets);
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
