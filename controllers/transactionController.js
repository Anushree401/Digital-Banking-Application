const { sequelize, Account, Transaction } = require('../database/models');

exports.transferMoney = async (req, res) => {
  const t = await sequelize.transaction();

  console.log("TRANSFER SESSION:", req.session);

  try {
    const { fromAccount, toAccount, amount } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sender = await Account.findOne({
      where: { acc_no: fromAccount },
      transaction: t
    });

    const receiver = await Account.findOne({
      where: { acc_no: toAccount },
      transaction: t
    });

    if (!sender || !receiver) {
      throw new Error('Invalid account');
    }

    if (parseFloat(sender.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    sender.balance -= amount;
    await sender.save({ transaction: t });

    receiver.balance += parseFloat(amount);
    await receiver.save({ transaction: t });

    await Transaction.create({
      from_account_id: sender.id,
      to_account_id: receiver.id,
      amount,
      transaction_type: 'transfer',
      timestamp: new Date(),
      status: 'success',
      description: 'Money transfer'
    }, { transaction: t });

    await t.commit();

    res.json({ message: 'Transfer successful' });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};