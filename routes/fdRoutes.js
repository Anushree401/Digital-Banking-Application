const express = require('express');
const router = express.Router();
const { FixedDeposit, Customer } = require('../database/models');

router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    // Get customer record
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get user's FDs
    const fds = await FixedDeposit.findAll({
      where: { customer_id: customer.id }
    });

    res.json(fds);

  } catch (err) {
    console.error('FDs fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;