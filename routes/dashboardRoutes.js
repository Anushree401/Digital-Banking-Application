const express = require('express');
const router = express.Router();
const { Account, Transaction, Loan, AccountHolder, Customer } = require('../database/models');

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get customer dashboard data
 *     description: Returns account summary, recent transactions, and loan count for logged-in user
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: number
 *                 monthlyIncome:
 *                   type: number
 *                 monthlyExpenses:
 *                   type: number
 *                 activeLoans:
 *                   type: integer
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       from_account_id:
 *                         type: integer
 *                       to_account_id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       transaction_type:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       status:
 *                         type: string
 *                       description:
 *                         type: string
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       acc_no:
 *                         type: string
 *                       acc_type:
 *                         type: string
 *                       balance:
 *                         type: number
 *       401:
 *         description: Unauthorized
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

    // Get customer record
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });
    console.log("CUSTOMER:", customer?.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get user's accounts
    const accountHolders = await AccountHolder.findAll({
      where: { customer_id: customer.id }
    });
    console.log("ACCOUNT HOLDERS:", accountHolders);
    const accountIds = accountHolders.map(ah => ah.account_id);
    console.log("ACCOUNT IDS:", accountIds);
    // Get user's accounts
    const accounts = await Account.findAll({
      where: { id: accountIds }
    });
    console.log("ACCOUNTS:", accounts);
    // Get user's transactions
    const transactions = await Transaction.findAll({
      attributes: [
        'id',
        'from_account_id',
        'to_account_id',
        'amount',
        'transaction_type',
        'timestamp',
        'status',
        'description'
      ],
      where: {
        [require('sequelize').Op.or]: [
          { from_account_id: accountIds },
          { to_account_id: accountIds }
        ]
      },
      order: [['timestamp', 'DESC']],
      limit: 5
    });

    // Calculate totals
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance || 0),
      0
    );

    // Get user's loans
    const loans = await Loan.count({
      where: { customer_id: customer.id }
    });

    res.json({
      totalBalance,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      activeLoans: loans,
      transactions,
      accounts   
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;