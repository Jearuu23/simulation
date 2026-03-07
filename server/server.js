const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

// ==========================================================================
// File system
// ==========================================================================
const jsonTemplate = {
	messages: [],
};

function readData() {
	try {
		if (!fs.existsSync("./messages.json")) {
			writeData(jsonTemplate);
			return jsonTemplate;
		}

		const data = fs.readFileSync("./messages.json", "utf8");

		if (!data.trim()) {
			writeData(jsonTemplate);
			return jsonTemplate;
		}

		const parsed = JSON.parse(data);
		return parsed;
	} catch (error) {
		console.error("Error reading file, using template:", error.message);
		return jsonTemplate;
	}
}

function writeData(data) {
	fs.writeFileSync("./messages.json", JSON.stringify(data, null, 2));
}

// ==========================================================================
// Routes
// ==========================================================================

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/log", (req, res) => {
	const text = req.body.text;
	console.log("logging:", text);
	res.json({ status: "ok" });
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

	messages.messages.push(newMessage);

	writeData(messages);

	res.send(messages);
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
