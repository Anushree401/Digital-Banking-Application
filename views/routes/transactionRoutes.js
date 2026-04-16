const express = require('express');
const router = express.Router();

const { Transaction, Account, AccountHolder, Customer } = require('../../database/models');

const { Op } = require('sequelize');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions (with filters)
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Credit or Debit
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    console.log("QUERY:", req.query);
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    const accountHolders = await AccountHolder.findAll({
      where: { customer_id: customer.id }
    });

    const accountIds = accountHolders.map(a => a.account_id);

    // filters from query
    const { type, startDate, endDate } = req.query;

    let where = {
      [Op.or]: [
        { from_account_id: accountIds },
        { to_account_id: accountIds }
      ]
    };

    // filter by type
    if (type) {
      where.transaction_type = type; // MUST match "Credit" / "Debit"
    }

    // filter by date
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const transactions = await Transaction.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });

    res.json(transactions);

  } catch (err) {
    console.error("TRANSACTION FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfer money between accounts
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAccount:
 *                 type: integer
 *               toAccount:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transfer successful
 *       400:
 *         description: Invalid input
 */
router.post('/transfer', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fromAccount, toAccount, amount } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    const holder = await AccountHolder.findOne({
      where: {
        customer_id: customer.id,
        account_id: fromAccount
      }
    });

    if (!holder) {
      return res.status(403).json({ error: 'Unauthorized account access' });
    }

    const fromAcc = await Account.findByPk(fromAccount);
    const toAcc = await Account.findOne({ where: { acc_no: toAccount } });

    console.log("FROM:", fromAccount);
    console.log("TO:", toAccount);

    if (!fromAcc || !toAcc) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    if (parseFloat(fromAcc.balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // update balances
    fromAcc.balance = parseFloat(fromAcc.balance) - amount;
    toAcc.balance = parseFloat(toAcc.balance) + amount;

    await fromAcc.save();
    await toAcc.save();

    // debit (sender)
    await Transaction.create({
      from_account_id: fromAcc.id,
      to_account_id: toAcc.id,
      amount,
      transaction_type: 'Debit',
      description: 'Transfer Sent',
      transaction_category: 'transfer',
      status: 'success'
    });

    // credit (receiver)
    await Transaction.create({
      from_account_id: fromAcc.id,
      to_account_id: toAcc.id,
      amount,
      transaction_type: 'Credit',
      description: 'Transfer Received'
    });

    res.json({ message: 'Transfer successful' });

  } catch (err) {
    console.error("TRANSFER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/transactions/bill:
 *   post:
 *     summary: Pay a bill
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAccount:
 *                 type: integer
 *               toAccount:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bill paid successfully
 */
router.post('/bill', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { fromAccount, toAccount, amount } = req.body;

        if (!fromAccount || !amount) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const fromAcc = await Account.findByPk(fromAccount);

        if (!fromAcc) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (parseFloat(fromAcc.balance) < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // deduct balance
        fromAcc.balance = parseFloat(fromAcc.balance) - amount;
        await fromAcc.save();

        const billerAcc = await Account.findOne({
          where: { acc_no: 'BILLER000' }
        });
        // create transaction
        await Transaction.create({
            from_account_id: fromAcc.id,
            to_account_id: billerAcc.id,
            amount,
            transaction_type: 'Debit', 
            description: `Bill payment: ${toAccount}`,
            transaction_category: 'transfer',
            status: 'success'
        });

        res.json({ message: 'Bill paid successfully' });

    } catch (err) {
        console.error("BILL ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Deposit money into account
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAccount:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deposit successful
 */
router.post('/deposit', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fromAccount, amount } = req.body;

    if (!fromAccount || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const acc = await Account.findByPk(fromAccount);

    if (!acc) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const cashAcc = await Account.findOne({
      where: { acc_no: 'CASH000' }
    });

    if (!cashAcc) {
      return res.status(500).json({ error: 'Cash account not found' });
    }

    acc.balance = parseFloat(acc.balance) + amount;
    await acc.save();
    
    await Transaction.create({
      from_account_id: fromAcc.id,
      to_account_id: toAcc.id,
      amount,
      transaction_type: 'Credit',
      description: 'Transfer Received',
      transaction_category: 'transfer',
      status: 'success'
    });

    res.json({ message: 'Deposit successful' });

  } catch (err) {
    console.error("DEPOSIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;