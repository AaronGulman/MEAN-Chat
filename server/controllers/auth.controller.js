const User = require('../models/user.model');

// Login Controller
const login = async (req, res, db) => {
  try {
    const { username, password } = req.body;

    // Find user by username and password
    const user = await db.collection('Users').findOne({ username });
    if (user) {
      res.status(200).json({ username: user.username, valid: true });
    } else {
      res.status(200).json({ valid: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

// Register Controller
const register = async (req, res, db) => {
  try {
    const { username, email, password } = req.body;
    // Check if the user already exists
    const existingUser = await db.collection('Users').findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User(Date.now().toString(), username, email, password, ["user"], []);

    // Insert the new user into the database
    const result = await db.collection('Users').insertOne(newUser);

    res.status(200).json({ message: 'User created successfully', valid: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

module.exports = { login, register };
