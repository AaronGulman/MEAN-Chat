import User from "../models/user.model";

const users = [
    new User(Date.now(), 'super', 'super@example.com', '123', ['superadmin'], [])
  ];
  
  const login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.status(200).json({ username, password });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  };
  
  const register = (req, res) => {
    const { username, email, password } = req.body;
  
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    const newUser = new User(Date.now(), username, email, password);
    users.push(newUser);
    res.status(201).json(newUser);
  };
  
  module.exports = { login, register };
  