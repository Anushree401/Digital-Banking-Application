const express = require('express');
const router = express.Router();
const { Loan } = require('../database/models');

router.get('/', async (req, res) => {
  try {
    const loans = await Loan.findAll();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;