const express = require('express');
const router = express.Router();


router.post('/api/auth/login', (req, res) => {
  const {username, password} = req.body;
  console.log(username,password);
  res.status(200).json({username, password});
});

router.post('/api/auth/register', (req, res) => {
  const {username, email, password} = req.body;
  console.log(username,email,password);
  res.status(200).json({username, email, password});
});

module.exports = router;