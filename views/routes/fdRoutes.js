const express = require('express');
const router = express.Router();

const { FixedDeposit, Account, Customer, Transaction } = require('../../database/models');

/**
 * @swagger
 * /api/fds:
 *   get:
 *     summary: Get user's fixed deposits
 *     tags:
 *       - Fixed Deposits
 *     responses:
 *       200:
 *         description: List of fixed deposits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   principal_amount:
 *                     type: number
 *                   interest_rate:
 *                     type: number
 *                   start_date:
 *                     type: string
 *                   maturity_date:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const fds = await FixedDeposit.findAll({
      where: { customer_id: customer.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(fds);

  } catch (err) {
    console.error("FD FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/fds/create:
 *   post:
 *     summary: Create a fixed deposit
 *     tags:
 *       - Fixed Deposits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               tenureMonths:
 *                 type: integer
 *     responses:
 *       200:
 *         description: FD created successfully
 *       400:
 *         description: Missing fields or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account or customer not found
 */
router.post('/create', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { accountId, amount, tenureMonths } = req.body;

    if (!accountId || !amount || !tenureMonths) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const acc = await Account.findByPk(accountId);

    if (!acc) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (parseFloat(acc.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const interestRate = 7;

    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    // deduct balance
    acc.balance = parseFloat(acc.balance) - amount;
    await acc.save();

    // create FD
    const fd = await FixedDeposit.create({
      customer_id: customer.id,
      linked_account_id: acc.id,
      principal_amount: amount,
      interest_rate: interestRate,
      start_date: startDate,
      maturity_date: maturityDate,
      status: 'active'
    });

    // log transaction
    await Transaction.create({
      from_account_id: acc.id,
      to_account_id: acc.id,
      amount,
      transaction_type: 'Debit',
      description: 'FD Created',
      status: 'success'
    });

    res.json({ message: 'FD created successfully', fd });

  } catch (err) {
    console.error("FD CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;