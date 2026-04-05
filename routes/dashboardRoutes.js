const express = require('express');
const router = express.Router();
const { Account, Transaction, Loan } = require('../database/models');
const dashboardController = require('../controllers/dashboardController');

router.get('/', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    const transactions = await Transaction.findAll({ limit: 5 });
    const loans = await Loan.count();

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance),
      0
    );

    res.json({
      totalBalance,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      activeLoans: loans,
      transactions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;