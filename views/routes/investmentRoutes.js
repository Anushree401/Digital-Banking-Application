const express = require('express');
const router = express.Router();
const { Investor, Offer, Account, Customer, AccountHolder, Transaction  } = require('../../database/models');

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get user investments
 *     tags:
 *       - Investments
 *     responses:
 *       200:
 *         description: List of investments
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    let investments;

    if (userRole === 'investor' || userRole === 'customer') {
        investments = await Investor.findAll({
            where: { user_id: userId }
        });
    } else if (userRole === 'loan_officer') {
        investments = await Investor.findAll();
    } else {
        investments = [];
    }

    const formatted = investments.map(inv => {
    const amt = Number(inv.investment_balance ?? 0);

    return {
        id: inv.id,
        name: inv.name || 'Investment',
        type: 'Portfolio',
        amount: amt,
        currentValue: amt * 1.1,
        returns: 10,
        investedDate: inv.createdAt,
        status: 'Active'
    };
  });

    res.json(formatted);

  } catch (err) {
    console.error('Investments fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/investments:
 *   post:
 *     summary: Create or add to investment portfolio
 *     tags:
 *       - Investments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Investment created or updated
 *       400:
 *         description: Invalid amount or insufficient balance
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const amount = Number(req.body.amount);
    const userId = req.session.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const holders = await AccountHolder.findAll({
      where: { customer_id: customer.id }
    });

    const accountIds = holders.map(h => h.account_id);

    if (accountIds.length === 0) {
      return res.status(404).json({ error: 'No accounts found' });
    } 

    const account = await Account.findOne({
      where: { id: accountIds[0] }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const balance = Number(account.balance);

    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    account.balance = balance - amount;
    await account.save();

    await Transaction.create({
      from_account_id: account.id,
      to_account_id: null,
      amount,
      transaction_type: 'Debit',
      description: 'Investment created',
      status: 'success'
    });

    let investment = await Investor.findOne({
      where: { user_id: userId }
    });

    if (investment) {
        // update existing portfolio
        investment.investment_balance =
        Number(investment.investment_balance || 0) + Number(amount);
        await investment.save();
    } else {
        // create first time
        investment = await Investor.create({
            user_id: userId,
            investment_balance: amount,
            risk_profile: 'medium'
        });
    }

    res.json(investment);

  } catch (err) {
    console.error('Create investment error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/investments/offers:
 *   get:
 *     summary: Get investment offers
 *     tags:
 *       - Investments
 *     responses:
 *       200:
 *         description: List of available offers
 */
router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.findAll();
    res.json(offers);
  } catch (err) {
    console.error('Offers fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/investments/{id}/withdraw:
 *   post:
 *     summary: Withdraw from investment
 *     tags:
 *       - Investments
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
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Withdraw successful
 *       400:
 *         description: Invalid amount or insufficient balance
 *       404:
 *         description: Investment not found
 */
router.post('/:id/withdraw', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const amount = Number(req.body.amount);
    const userId = req.session.user.id;

    const investment = await Investor.findOne({
      where: { user_id: userId }
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const invBalance = Number(investment.investment_balance);

    if (invBalance < amount) {
      return res.status(400).json({ error: 'Insufficient investment balance' });
    }

    investment.investment_balance = invBalance - amount;
    await investment.save();

    // get account again (same logic as before)
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    const holders = await AccountHolder.findAll({
      where: { customer_id: customer.id }
    });

    if (holders.length === 0) {
      return res.status(404).json({ error: 'No accounts found' });
    }

    const account = await Account.findOne({
      where: { id: holders[0].account_id }
    });

    account.balance = Number(account.balance) + amount;
    await account.save();

    await Transaction.create({
      from_account_id: null,
      to_account_id: account.id,
      amount,
      transaction_type: 'Credit',
      description: 'Investment withdrawal',
      status: 'success'
    });

    res.json({ message: 'Withdraw successful' });

  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;