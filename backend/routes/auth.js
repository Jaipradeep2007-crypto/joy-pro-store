const express = require('express');
const router = express.Router();

// TEST
router.get('/', (req, res) => {
  res.send('Auth API working ✅');
});

// REGISTER
router.post('/register', (req, res) => {
  res.send('User registered');
});

// LOGIN
router.post('/login', (req, res) => {
  res.send('User logged in');
});

module.exports = router;
