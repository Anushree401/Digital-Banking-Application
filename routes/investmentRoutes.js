const express = require('express');
const router = express.Router();
const { Investor, Offer } = require('../database/models');

router.get('/', async (req, res) => {
  try {
    const investments = await Investor.findAll();
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.findAll();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;