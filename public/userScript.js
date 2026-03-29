const chatMessagesContainer = document.getElementById("chatMessagesContainer");
const chatMessageInput = document.getElementById("chatMessageInput");
const secretKeyInputElement = document.getElementById("secretKeyInput");
const secretKeyPromptModal = document.getElementById("secretKeyPromptModal");
const modalOverlay = document.getElementById("modalOverlay");
const role = new URLSearchParams(window.location.search).get("role");
const changeKeyDialog = document.getElementById("changeKeyDialog");
const errorMessageElement = document.getElementById("errorMessage");

let secretKey = "";

function showKeyPrompt() {
	secretKeyPromptModal.style.display = "block";
	modalOverlay.style.display = "block";
}
function hideModal() {
	secretKeyPromptModal.style.display = "none";
	modalOverlay.style.display = "none";

	changeKeyDialog.style.display = "none";
	modalOverlay.style.display = "none";
}
function scrollToBottom() {
	chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

loadMessages();
async function loadMessages() {
	const messages = await fetchMessages();
	renderMessages(messages);
}
// ==========================================================================
// change key
// ==========================================================================
function showChangeKeyModal() {
	changeKeyDialog.style.display = "block";
	modalOverlay.style.display = "block";
}
async function changeKey() {
	const newSecretKey = document.getElementById("newSecretKeyInput").value.trim();
	const oldSecretKey = document.getElementById("oldSecretKeyInput").value.trim();
	if (!newSecretKey || !oldSecretKey) return alert("Please enter all keys!");
	if (oldSecretKey !== secretKey) return alert("Please enter the correct old key!");
	if (oldSecretKey === newSecretKey) return;

	localStorage.setItem("secretKey", newSecretKey);

	// const oldKey = secretKey;
	secretKey = newSecretKey;
	hideModal();

	const messages = await fetchMessages();

	const decryptedMessages = await Promise.all(messages.map(async (message) => await decryptData(message, oldSecretKey)));
	const encryptedMessages = await Promise.all(decryptedMessages.map(async (message) => await encryptData(message, newSecretKey)));

	try {
		fetch("http://localhost:3000/changekey", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				key: newSecretKey,
				messages: encryptedMessages,
			}),
		});
		alert("Key changed successfully!");
	} catch (e) {
		log("error:", e);
	}

	document.location.reload();
}

async function submitKey() {
	secretKey = secretKeyInputElement.value.trim();
	if (!secretKey) return alert("Please enter a key!");

	localStorage.setItem("secretKey", secretKey);
	hideModal();
	await loadMessages();
}

// ==========================================================================
// fetch messages
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
	if (!role) document.location.href = "index.html";
	const secretKeyStorage = localStorage.getItem("secretKey");

	if (secretKeyStorage) {
		secretKey = secretKeyStorage;
		hideModal();
	}
});

async function fetchMessages() {
	let messagesJSON = { messages: [] };
	try {
		const res = await fetch("http://localhost:3000/message");
		messagesJSON = await res.json();
	} catch (error) {
		errorMessageElement.style.display = "block";
		errorMessageElement.innerHTML = `<div class="entry" style="color:red">[ERROR] Failed to connect to server: ${error.message}</div>`;

		setTimeout(() => {
			errorMessageElement.style.display = "none";
		}, 5000);

		return;
	}
	return messagesJSON.messages;
}

// ==========================================================================
// send message
// ==========================================================================
async function sendMessage() {
	const text = chatMessageInput.value.trim();
	if (!text) return;

	if (!secretKey) {
		alert("Please enter a key!");
		return;
	}

	const messageData = {
		from: role,
		text: text,
		time: new Date().toISOString(),
	};
	chatMessageInput.value = "";

	const encryptedMessageData = await encryptData(messageData, secretKey);
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

chatMessageInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") sendMessage();
});

// ==========================================================================
// render messages
// ==========================================================================
async function renderMessages(messages) {
	if (!messages) {
		errorMessageElement.style.display = "block";
		errorMessageElement.innerHTML = `<div class="entry" style="color:red">Failed to fetch messages from server</div>`;

		setTimeout(() => {
			errorMessageElement.style.display = "none";
		}, 5000);
		return;
	}

	if (messages.length === 0) {
		console.log("no messages");

		const row = document.createElement("div");
		row.innerHTML = `<div class="message-row user">Start Chatting<div/>`;
		chatMessagesContainer.appendChild(row);
		return;
	}

	chatMessagesContainer.innerHTML = "";
	for (let message of messages) {
		const decryptedMessage = await decryptData(message, secretKey);
		if (decryptedMessage.from === "System") {
			showKeyPrompt();
			return;
		}
		const row = document.createElement("div");
		let className = decryptedMessage.from === role ? "message-row user" : "message-row other";
		if (decryptedMessage.from === "System") {
			row.innerHTML = `<div class="${className} system"><div class="message">${decryptedMessage.text}</div></div>`;
			chatMessagesContainer.appendChild(row);
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
		chatMessagesContainer.appendChild(row);
	}
	scrollToBottom();
}

// ==========================================================================
// encryption and decryption
// ==========================================================================

async function getKey(rawKey) {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(rawKey.padEnd(32, "0").slice(0, 32));

	return await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptData(messageData, secretKey) {
	const encoder = new TextEncoder();

	const data = encoder.encode(JSON.stringify(messageData));

	// The IV (Initialization Vector) must be unique for every message
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await getKey(secretKey);

	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);

	// We must send the IV along with the ciphertext so the receiver can decrypt it
	return {
		iv: btoa(String.fromCharCode(...iv)), // Convert to Base64 for transport
		ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
	};
}

async function decryptData(encryptedData, secretKey) {
	try {
		const key = await getKey(secretKey);

		// Convert Base64 strings back to Uint8Arrays
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

		// Decrypt using Web Crypto API
		const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);

		// Decode the bytes back into a JSON string, then an object
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
			text: "[" + role + "] " + args.join(" "),
		}),
	});
}
