const express = require('express');
const router = express.Router();

const { Transaction, Account, AccountHolder, Customer } = require('../database/models');

const { Op } = require('sequelize');

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

router.post('/transfer', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fromAccount, toAccount, amount } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
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
      description: 'Transfer Sent'
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
            description: `Bill payment: ${toAccount}`
        });

        res.json({ message: 'Bill paid successfully' });

    } catch (err) {
        console.error("BILL ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

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

    // update balance
    acc.balance = parseFloat(acc.balance) + amount;
    await acc.save();

    await Transaction.create({
      from_account_id: acc.id,
      to_account_id: acc.id,
      amount,
      transaction_type: 'Credit',
      description: 'Deposit'
    });

    res.json({ message: 'Deposit successful' });

  } catch (err) {
    console.error("DEPOSIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;