const express = require('express');
const router = express.Router();
const { Investor, Offer } = require('../database/models');

router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    let investments;

    if (userRole === 'investor') {
      // Investors see only their own investments
      investments = await Investor.findAll({
        where: { user_id: userId }
      });
    } else if (userRole === 'loan_officer') {
      // Loan officers can see all investments for portfolio management
      investments = await Investor.findAll();
    } else {
      // Customers don't see investments
      investments = [];
    }

    res.json(investments);

  } catch (err) {
    console.error('Investments fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.findAll();
    res.json(offers);
  } catch (err) {
    console.error('Offers fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;