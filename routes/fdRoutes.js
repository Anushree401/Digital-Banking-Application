const express = require('express');
const router = express.Router();
const { FixedDeposit } = require('../database/models');

router.get('/', async (req, res) => {
  try {
    const fds = await FixedDeposit.findAll();
    res.json(fds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;