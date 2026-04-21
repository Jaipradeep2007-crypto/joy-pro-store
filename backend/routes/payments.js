const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Payments API working ✅');
});

module.exports = router;
