const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { Card, AccountHolder, Customer, Account, User } = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get user's active cards
 *     tags:
 *       - Cards
 *     responses:
 *       200:
 *         description: List of active cards
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get user's active cards
 *     tags:
 *       - Cards
 *     responses:
 *       200:
 *         description: List of active cards
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/cards/approve/{id}:
 *   put:
 *     summary: Approve a card
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card approved
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
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

/**
 * @swagger
 * /api/cards/reject/{id}:
 *   put:
 *     summary: Reject a card
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card rejected
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
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

/**
 * @swagger
 * /api/cards/pending:
 *   get:
 *     summary: Get all pending card applications
 *     tags:
 *       - Cards
 *     responses:
 *       200:
 *         description: List of pending cards
 *       403:
 *         description: Forbidden
 */
router.get('/pending', authorize('loan_officer'), async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'loan_officer') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const cards = await Card.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Account,
          attributes: ['id', 'acc_no', 'acc_type', 'balance'],
          include: [
            {
              model: AccountHolder,
              attributes: ['customer_id', 'is_primary'],
              include: [
                {
                  model: Customer,
                  attributes: ['id', 'kyc_status'],
                  include: [
                    {
                      model: User,
                      attributes: ['fname', 'lname', 'email', 'phone']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mapped = cards.map(card => {
      const account = card.Account || {};
      const accountHolders = account.AccountHolders || [];
      const primaryHolder = accountHolders.find(holder => holder.is_primary) || accountHolders[0] || {};
      const customer = primaryHolder.Customer || {};
      const customerUser = customer.User || {};

      return {
        id: card.id,
        account_id: card.account_id,
        account_number: account.acc_no || `ACC-${card.account_id}`,
        account_type: account.acc_type || '--',
        customer_id: primaryHolder.customer_id || null,
        customer_name: [customerUser.fname, customerUser.lname].filter(Boolean).join(' ') || `Customer #${primaryHolder.customer_id || card.account_id}`,
        customer_email: customerUser.email || '--',
        card_type: card.card_type,
        expiry_date: card.expiry_date,
        status: card.status,
        requested_at: card.createdAt
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;