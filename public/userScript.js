const messagesElement = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const decryptionSecretElement = document.getElementById("decryptionSecret");
const decryptionSecretModal = document.getElementById("decryptionSecretModal");
const overlay = document.getElementById("overlay");
const role = new URLSearchParams(window.location.search).get("role");
const modal = document.getElementById("changeKeyModal");

let secretKey = "";

function hideModal() {
	decryptionSecretModal.style.display = "none";
	overlay.style.display = "none";

	modal.style.display = "none";
	overlay.style.display = "none";
}

// ==========================================================================
// change key
// ==========================================================================
function showChangeKeyModal() {
	modal.style.display = "block";
	overlay.style.display = "block";
}
function changeKey() {
	const newKey = document.getElementById("newKey").value.trim();
	if (!newKey) return alert("Please enter a key!");
	localStorage.setItem("secretKey", newKey);
	hideModal();
	secretKey = newKey;
	document.location.reload();
}

// ==========================================================================
// fetch messages
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
	const secretKeyStorage = localStorage.getItem("secretKey");

	if (secretKeyStorage) {
		log("using storage key");
		secretKey = secretKeyStorage;
		hideModal();
	}
});

async function submitKey() {
	secretKey = decryptionSecretElement.value.trim();
	if (!secretKey) return alert("Please enter a key!");

	localStorage.setItem("decryptionSecretKey", secretKey);
	hideModal();
	await fetchMessages();
}

async function fetchMessages() {
	const messagesJSON = await fetch("http://localhost:3000/message")
		.then((res) => res.json())
		.catch(console.error);

	renderMessages(messagesJSON.messages);
}

fetchMessages();
// });

// ==========================================================================
// send message
// ==========================================================================
async function sendMessage() {
	const text = messageInput.value.trim();
	if (!text) {
		alert("Please enter a message!");
		return;
	}

	if (!secretKey) {
		alert("Please enter a key!");
		return;
	}

	const messageData = {
		from: role,
		text: text,
		time: new Date().toISOString(),
	};
	messageInput.value = "";

	messagesElement.scrollTop = messagesElement.scrollHeight;

	const encryptedMessageData = await encryptData(messageData, secretKey);
	log("sending:", encryptedMessageData.ciphertext);
	const res = await fetch("http://localhost:3000/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(encryptedMessageData),
	});
	const data = await res.json();
	renderMessages(data.messages);
}

messageInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") sendMessage();
});

// ==========================================================================
// render messages
// ==========================================================================
async function renderMessages(messages) {
	messagesElement.innerHTML = "";
	for (let message of messages) {
		const decryptedMessage = await decryptData(message, secretKey);
		const row = document.createElement("div");
		let className = decryptedMessage.from === role ? "message-row user" : "message-row other";
		if (decryptedMessage.from === "System") {
			row.innerHTML = `<div class="${className} system"><div class="message">${decryptedMessage.text}</div></div>`;
			messagesElement.appendChild(row);
			continue;
		}
		row.innerHTML = `
					<div class="${className}">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="avatar">
							<path
								d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
						</svg>
						<div class="message">${decryptedMessage.text}</div>
					</div>`;
		messagesElement.appendChild(row);
	}
}

// ==========================================================================
// encryption and decryption
// ==========================================================================

async function getKey(rawKey) {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(rawKey.padEnd(32, "0").slice(0, 32));

	return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptData(messageData, password) {
	const encoder = new TextEncoder();

	const data = encoder.encode(JSON.stringify(messageData));

	// The IV (Initialization Vector) must be unique for every message
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await getKey(password);

	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);

	// We must send the IV along with the ciphertext so the receiver can decrypt it
	return {
		iv: btoa(String.fromCharCode(...iv)), // Convert to Base64 for transport
		ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
	};
}

async function decryptData(encryptedData, password) {
	try {
		const key = await getKey(password);

		// 1. Convert Base64 strings back to Uint8Arrays
		const iv = new Uint8Array(
			atob(encryptedData.iv)
				.split("")
				.map((c) => c.charCodeAt(0)),
		);
		const ciphertext = new Uint8Array(
			atob(encryptedData.ciphertext)
				.split("")
				.map((c) => c.charCodeAt(0)),
		);

		// 2. Decrypt using Web Crypto API
		const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);

		// 3. Decode the bytes back into a JSON string, then an object
		const decoder = new TextDecoder();
		return JSON.parse(decoder.decode(decryptedBuffer));
	} catch (error) {
		console.error("Decryption failed:", error);
		return { from: "System", text: "[Invalid Key or Corrupt Data]", time: "" };
	}
}

// ==========================================================================
// Logging
// ==========================================================================
async function log(...args) {
	await fetch("http://localhost:3000/log", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: args.join(" "),
		}),
	});
}
