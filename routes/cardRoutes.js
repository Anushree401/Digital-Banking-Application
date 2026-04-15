const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { Card, AccountHolder, Customer, Account, User } = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');
const { Transaction } = require('../database/models');
const { Op } = require('sequelize');

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
        account_id: accountIds
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
 * /api/cards/apply:
 *   post:
 *     summary: Apply for a card
 *     tags:
 *       - Cards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardType:
 *                 type: string
 *                 enum: ['credit', 'debit']
 *               accountId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card application submitted
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Unauthorized account access
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

    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    const holder = await AccountHolder.findOne({
      where: {
        account_id: accountId,
        customer_id: customer.id
      }
    });

    if (!holder) {
      return res.status(403).json({ error: 'Unauthorized account access' });
    }

    const existing = await Card.findOne({
      where: {
        account_id: accountId,
        status: {
          [Op.in]: ['pending', 'active']
        }
      }
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Card already exists',
        accountId,
        status: existing.status
      });
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

    res.json({
      message: 'Card application submitted',
      card: newCard,
      cvv
    });

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

    await Transaction.create({
      from_account_id: card.account_id,
      to_account_id: card.account_id,
      amount: 0,
      transaction_type: 'Debit',
      description: 'Card Issued',
      status: 'success'
    });

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

/**
 * @swagger
 * /api/cards/block/{id}:
 *   put:
 *     summary: Block a card
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
 *         description: Card blocked
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
router.put('/block/:id', async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    card.status = 'blocked';
    await card.save();

    res.json({ message: 'Card blocked' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cards/set-pin/{id}:
 *   put:
 *     summary: Set a card's PIN
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: PIN set successfully
 *       400:
 *         description: Invalid PIN
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
router.put('/set-pin/:id', async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }

    const card = await Card.findByPk(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const bcrypt = require('bcrypt');
    const pinHash = await bcrypt.hash(pin, 10);

    card.pin_hash = pinHash;
    await card.save();

    res.json({ message: 'PIN set successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cards/limit/{id}:
 *   put:
 *     summary: Set card spending limit
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Card spending limit set successfully
 *       400:
 *         description: Invalid limit
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 * */
router.put('/limit/:id', async (req, res) => {
  try {
    const { limit } = req.body;

    if (!limit || limit <= 0) {
      return res.status(400).json({ error: 'Invalid limit' });
    }

    const card = await Card.findByPk(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    card.limit = limit;
    await card.save();

    res.json({ message: 'Limit updated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/cards/{id}/unblock:
 *   put:
 *     summary: Unblock a card
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
 *         description: Card unblocked
 *       400:
 *         description: Card is not blocked
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
router.put('/unblock/:id', async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (card.status !== 'blocked') {
      return res.status(400).json({ error: 'Card is not blocked' });
    }

    card.status = 'active';
    await card.save();

    res.json({ message: 'Card unblocked' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;