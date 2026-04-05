const { Account, Transaction, Loan } = require('../database/models');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const accounts = await Account.findAll({
      where: { acc_id: userId }
    });

    const accountNumbers = accounts.map(acc => acc.acc_no);

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance),
      0
    );

    const transactions = await Transaction.findAll({
      where: {
        from_account_id: accountNumbers
      },
      limit: 5,
      order: [['timestamp', 'DESC']]
    });

    const loans = await Loan.count({
      where: {
        customer_id: userId,
        status: 'active'
      }
    });

    res.json({
      totalBalance,
      monthlyIncome: 6200,
      monthlyExpenses: 2150,
      activeLoans: loans,
      transactions
    });

    console.log("SESSION AFTER LOGIN:", req.session);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};