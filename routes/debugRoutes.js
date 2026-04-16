const express = require('express');
const router = express.Router();
const {
  Account,
  Transaction,
  User,
  Customer,
  AccountHolder
} = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/all', authorize('loan_officer'), async (req, res) => {
  const users = await User.findAll();
  const accounts = await Account.findAll();
  const transactions = await Transaction.findAll();
  const customers = await Customer.findAll();
  const holders = await AccountHolder.findAll();

  res.json({
    users,
    customers,
    account_holders: holders,
    accounts,
    transactions
  });
});

module.exports = router;