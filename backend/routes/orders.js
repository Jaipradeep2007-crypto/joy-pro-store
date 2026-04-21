const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Orders API working ✅');
});

module.exports = router;
