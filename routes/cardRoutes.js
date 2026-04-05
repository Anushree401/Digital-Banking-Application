const express = require('express');
const router = express.Router();

const { Card, AccountHolder, Customer } = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    // get customer
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    // get user's accounts
    const accountHolders = await AccountHolder.findAll({
      where: { customer_id: customer.id }
    });

    const accountIds = accountHolders.map(a => a.account_id);

    // get cards linked to those accounts
    const cards = await Card.findAll({
      where: {
        account_id: accountIds,
        status: 'active'
      }
    });

    res.json(cards);

  } catch (err) {
    console.error("CARD FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { cardType, accountId } = req.body;

    if (!cardType || !accountId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // generate fake card number
    const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 5);

    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const cvvHash = await bcrypt.hash(cvv, 10);

    const newCard = await Card.create({
      account_id: accountId,
      card_number: cardNumber,
      card_type: cardType,
      expiry_date: expiry,
      status: 'pending',
      cvv_hash: cvvHash 
    });

    res.json(newCard);

  } catch (err) {
    console.error("CARD APPLY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/approve/:id', authorize('loan_officer'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'loan_officer') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const card = await Card.findByPk(req.params.id);

    if (!card) return res.status(404).json({ error: 'Card not found' });

    card.status = 'active';
    await card.save();

    res.json({ message: 'Card approved' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reject/:id', authorize('loan_officer'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'loan_officer') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const card = await Card.findByPk(req.params.id);

    if (!card) return res.status(404).json({ error: 'Card not found' });

    card.status = 'rejected';
    await card.save();

    res.json({ message: 'Card rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', authorize('loan_officer'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'loan_officer') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const cards = await Card.findAll({
      where: { status: 'pending' }
    });

    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;