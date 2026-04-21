const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, name: "Black Cap", price: 299 },
    { id: 2, name: "White Cap", price: 399 }
  ]);
});

module.exports = router;
