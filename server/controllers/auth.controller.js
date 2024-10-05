const fs = require('fs');
const path = require('path');
const User = require('../models/user.model');

// File path for storing users
const userFilePath = path.join(__dirname, '../users.json');

// Helper function to read data from JSON file
const readData = () => {
  if (fs.existsSync(userFilePath)) {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
};

// Helper function to write data to JSON file
const writeData = (data) => {
  fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Login Controller
const login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username and password
    const users = readData();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      res.status(200).json({ username: user.username, valid: true });
    } else {
      res.status(200).json({ valid: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register Controller
const register = (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const users = readData();
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User(Date.now().toString(), username, email, password, ["user"], []);

    users.push(newUser);
    writeData(users);

    res.status(200).json({ message: 'User created successfully', valid: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

module.exports = { login, register };