# Information Assurance Simulation

An interactive web-based simulation platform for educational purposes, demonstrating real-time communication between different user roles in a security scenario. This project showcases a chat application with distinct interfaces for regular users and attackers, built with Node.js and Express.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [How to Use](#how-to-use)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)

## 🎯 Overview

This Information Assurance simulation is designed for educational purposes to demonstrate cybersecurity concepts and user interactions in a controlled environment. The application features two distinct user interfaces:

- **Normal User Interface**: A standard chat application for regular users
- **Attacker Interface**: A terminal-styled interface simulating an intrusion detection scenario

The backend manages real-time message exchanges and data persistence through JSON-based storage.

## ✨ Features

- **Dual User Interfaces**: Different UI experiences for users and attackers
- **Real-time Messaging**: Send and receive messages in real-time
- **Data Persistence**: Messages stored in JSON file system
- **CORS Support**: Cross-origin resource sharing enabled for flexibility
- **Responsive Design**: Mobile-friendly web interfaces
- **Terminal-style Interface**: Attacker interface with hacker aesthetic
- **Login System**: Basic authentication interface

## 📁 Project Structure

```
simulation/
├── README.md                 # Project documentation
├── public/                   # Frontend files (served statically)
│   ├── index.html           # Login page
│   ├── user.html            # User chat interface
│   ├── attacker.html        # Attacker interface (terminal style)
│   ├── userScript.js        # Client-side JavaScript logic
│   └── userStyle.css        # Styling for user interface
├── server/                  # Backend Node.js server
│   ├── server.js            # Main server file (Express app)
│   ├── package.json         # Project dependencies
│   ├── messages.json        # Persistent message storage
│   └── log.txt              # Server logs
```

## 🚀 How to Use

### Quick Start

1. **Install Dependencies**

    ```bash
    cd server
    npm install
    ```

2. **Start the Server**

    ```bash
    npm run dev
    ```

    The server will start on `http://localhost:3000`

3. **Access the Application**
    - Open your browser and navigate to `http://localhost:3000`
    - You'll see the login page (`index.html`)
    - Access the user chat interface at `http://localhost:3000/user.html`
    - Access the attacker interface at `http://localhost:3000/attacker.html`

### Typical Workflow

1. Start the server using `npm run dev` in the `server/` directory
2. Open the login page in your browser
3. Navigate to either the user or attacker interface based on your role
4. Send messages through the respective interface
5. Messages are stored in `messages.json` for persistence

## 📦 Installation

### Requirements

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Steps

1. **Clone or Download the Project**

    ```bash
    cd simulation
    ```

2. **Navigate to Server Directory**

    ```bash
    cd server
    ```

3. **Install npm Dependencies**
    ```bash
    npm install
    ```
    This installs:
    - `express`: Web framework
    - `cors`: Cross-origin resource sharing middleware
    - `daemon`: Background process management

## 🏃 Running the Server

### Development Mode

```bash
cd server
npm run dev
```

The server will:

- Start on port 3000
- Serve static files from the `public/` directory
- Initialize `messages.json` if it doesn't exist
- Display "Hello World!" at the root endpoint

### Server Output

When the server starts successfully, you should see:

```
Server running on http://localhost:3000
```

## � Tips & Best Practices

### Testing Multiple Roles Simultaneously

To effectively test the simulation with both user and attacker roles, use one of these approaches:

**Option 1: Different Browsers**

- Open **Chrome** for the normal user interface
- Open **Firefox** for the attacker interface
- Open **Safari** or **Edge** for additional testing
- This keeps sessions completely isolated

**Option 2: Incognito/Private Windows**

- Open an **Incognito window** (Ctrl+Shift+N in Chrome) for the user role
- Open a **Private window** (Ctrl+Shift+P in Firefox) for the attacker role
- This prevents cookie/session conflicts between roles
- Great for testing without affecting other tabs

**Option 3: Multiple Tabs in Same Window**

- Use tabs for quick role switching
- Clear browser cache between role switches if needed
- Less isolated but convenient for development

**Recommended Approach**: Use **different browsers or incognito windows** for realistic testing of multi-user scenarios.

## �👥 User Roles

### Normal User

- Accesses the chat interface at `/user.html`
- Clean, standard chat interface
- Can send and receive messages
- Styled with CSS for professional appearance

### Attacker

- Accesses the simulation at `/attacker.html`
- Terminal-style interface with hacker aesthetic
- Green text on dark background (classic hacker look)
- "Intrusion Detected - Data Breach" themed interface
- Educational purpose: demonstrates attack scenarios

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000
```

### Available Endpoints

| Method | Endpoint    | Purpose                                 |
| ------ | ----------- | --------------------------------------- |
| GET    | `/`         | Hello World (test endpoint)             |
| POST   | `/messages` | Submit a message (custom endpoint)      |
| GET    | `/messages` | Retrieve all messages (custom endpoint) |

**Note**: Detailed API documentation can be added based on your specific implementation of message endpoints.

## 🛠️ Technology Stack

- **Backend**:
    - Node.js
    - Express.js (Web framework)
    - CORS (Cross-origin support)
- **Frontend**:
    - HTML5
    - CSS3
    - Vanilla JavaScript
- **Data Storage**:
    - JSON file system
    - File system operations with `fs` module

## 📝 Notes

- Messages are stored in `server/messages.json` in JSON format
- Server logs are recorded in `server/log.txt`
- The application uses file-based storage (suitable for educational purposes)
- For production use, consider upgrading to a database (MongoDB, PostgreSQL, etc.)

## 🔒 Security Notice

This is an educational simulation. Do not use in production environments without proper security hardening, authentication measures, and encryption protocols.

---

**Created for**: Information Assurance Course - CVSU  
**Last Updated**: 2026  
**README Documentation**: Created by GitHub Copilot
