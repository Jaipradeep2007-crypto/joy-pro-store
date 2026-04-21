const express = require('express');
const router = express.Router();

// THIS FIXES YOUR ERROR
router.get('/', (req, res) => {
    res.send('Auth API working ✅');
});

module.exports = router;
