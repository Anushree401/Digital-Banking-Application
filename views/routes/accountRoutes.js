const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Account, AccountHolder, Customer } = require('../../database/models');
const { Transaction } = require('../../database/models');

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get user accounts
 *     description: Returns all bank accounts linked to the logged-in user
 *     tags:
 *       - Accounts
 *     responses:
 *       200:
 *         description: List of user accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   acc_no:
 *                     type: string
 *                   acc_type:
 *                     type: string
 *                   balance:
 *                     type: number
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized (user not logged in)
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const accountHolders = await AccountHolder.findAll({
      where: { customer_id: customer.id },
      include: [
        { model: Account }
      ]
    });

    const accounts = accountHolders.map(ah => ah.Account);

    res.json(accounts);

  } catch (err) {
    console.error("ACCOUNTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    const { acc_type } = req.body;

    const newAccount = await Account.create({
      acc_no: 'ACC' + Date.now(),
      acc_type,
      balance: 0
    });

    await AccountHolder.create({
      account_id: newAccount.id,
      customer_id: customer.id,
      is_primary: false
    });

    res.json(newAccount);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/close/:id', async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.status = 'closed';
    await account.save();

    res.json({ message: 'Account closed successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id/transactions', async (req, res) => {
  try {
    const txns = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_account_id: req.params.id },
          { to_account_id: req.params.id }
        ]
      }
    });

    res.json(txns);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;