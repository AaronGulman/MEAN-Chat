const User = require('../models/user.model');

const users = [
    new User(Date.now(), 'super', 'super@example.com', '123', ['superadmin'], [])
  ];
  
  const login = (req, res, db) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.status(200).json({ username: user.username, valid: true });
    } else {
      res.status(200).json({ valid: false, message: 'Invalid credentials' });
    }
  };
  
  const register = (req, res, db) => {
    // 
  
    // if (users.find(u => u.username === username)) {
    //   return res.status(400).json({ message: 'User already exists' });
    // }
  
    // const newUser = new User(Date.now(), username, email, password);
    // users.push(newUser);
    // res.status(201).json(newUser);
    const { username, email, password } = req.body;
    res.status(201).json({ valid: true});
  };
  
  module.exports = { login, register };
  