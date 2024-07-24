// Authors: Shira Saban Bitton - 316511658, Fida Rabah - 204647911
// Date: 2024-07-02
// Description: Express server for the task manager application. Manages user authentication, task operations, and data persistence using a JSON file.

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.json');

let data = {};

// Load data from file
const loadData = () => {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        data = JSON.parse(rawData);
    } else {
        data = { users: {}, tasks: {} };
    }
};

// Save data to file
const saveData = () => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Initialize data
loadData();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handle login and registration
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!data.users[username]) {
        data.users[username] = { password, tasks: [] };
    }
    if (data.users[username].password === password) {
        res.cookie('username', username, { maxAge: 900000, httpOnly: true });
        saveData();
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Handle logout
app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.json({ success: true });
});

// Check authentication status
app.get('/checkAuth', (req, res) => {
    if (req.cookies.username && data.users[req.cookies.username]) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Get tasks for authenticated user
app.get('/tasks', (req, res) => {
    const username = req.cookies.username;
    if (username && data.users[username]) {
        res.json(data.users[username].tasks);
    } else {
        res.status(401).json([]);
    }
});

// Add a new task
app.post('/tasks', (req, res) => {
    const username = req.cookies.username;
    if (username && data.users[username]) {
        const task = { id: Date.now(), text: req.body.task };
        data.users[username].tasks.push(task);
        saveData();
        res.json({ success: true, task });
    } else {
        res.status(401).json({ success: false });
    }
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const username = req.cookies.username;
    if (username && data.users[username]) {
        const taskId = parseInt(req.params.id, 10);
        data.users[username].tasks = data.users[username].tasks.filter(task => task.id !== taskId);
        saveData();
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// Reorder tasks
app.post('/tasks/reorder', (req, res) => {
    const username = req.cookies.username;
    if (username && data.users[username]) {
        const { taskIds } = req.body;
        data.users[username].tasks = taskIds.map(id => data.users[username].tasks.find(task => task.id == id));
        saveData();
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
