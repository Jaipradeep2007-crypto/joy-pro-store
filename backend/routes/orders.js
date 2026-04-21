const express = require('express');
const router = express.Router();

// FIXED ROUTE
router.get('/', (req, res) => {
    res.send('Orders API working ✅');
});

module.exports = router;
