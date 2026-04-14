const express = require('express');
const router = express.Router();

const { FixedDeposit, Account, AccountHolder, Customer, Transaction } = require('../database/models');


router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    const fds = await FixedDeposit.findAll({
      where: { customer_id: customer.id },
      order: [['createdAt', 'DESC']]
    });

    console.log("CUSTOMER:", customer);
    console.log("FDS:", fds);

    res.json(fds);

    console.log("CUSTOMER:", customer);
    console.log("FDS:", fds);

  } catch (err) {
    console.error("FD FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



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