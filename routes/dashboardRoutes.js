const express = require('express');
const router = express.Router();
const { Account, Transaction, Loan, AccountHolder, Customer } = require('../database/models');

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