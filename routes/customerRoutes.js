const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Customer, User, AccountHolder, Account, Loan } = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');

function maskValue(value, visible = 4) {
  if (!value) return '--';
  const text = String(value);
  if (text.length <= visible) return text;
  return `${text.slice(0, visible)}${'*'.repeat(Math.max(text.length - visible, 0))}`;
}

function buildCustomerPayload(customer) {
  const user = customer.User || {};
  const accountHolders = customer.AccountHolders || [];
  const accounts = accountHolders.map(holder => holder.Account).filter(Boolean);
  const loans = customer.Loans || [];

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const primaryAccount = accountHolders.find(holder => holder.is_primary)?.Account || accounts[0] || null;

  return {
    id: customer.id,
    user_id: customer.user_id,
    customer_type: customer.customer_type,
    kyc_status: customer.kyc_status,
    pan_number: maskValue(customer.pan_number, 3),
    adhaar_number: maskValue(customer.adhaar_number, 4),
    name: [user.fname, user.lname].filter(Boolean).join(' ') || `Customer #${customer.id}`,
    email: user.email || '--',
    phone: user.phone || '--',
    account_count: accounts.length,
    loan_count: loans.length,
    total_balance: totalBalance,
    primary_account: primaryAccount ? {
      id: primaryAccount.id,
      acc_no: primaryAccount.acc_no,
      acc_type: primaryAccount.acc_type,
      balance: primaryAccount.balance
    } : null,
    accounts: accounts.map(account => ({
      id: account.id,
      acc_no: account.acc_no,
      acc_type: account.acc_type,
      balance: account.balance,
      status: account.status
    })),
    loans: loans.map(loan => ({
      id: loan.id,
      loan_type: loan.loan_type,
      principal_amount: loan.principal_amount,
      status: loan.status
    }))
  };
}

router.get('/', authorize('loan_officer'), async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: User,
          attributes: ['fname', 'lname', 'email', 'phone']
        },
        {
          model: AccountHolder,
          include: [
            {
              model: Account,
              attributes: ['id', 'acc_no', 'acc_type', 'balance', 'status']
            }
          ]
        },
        {
          model: Loan,
          attributes: ['id', 'loan_type', 'principal_amount', 'status']
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(customers.map(buildCustomerPayload));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending-kyc', authorize('loan_officer'), async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        kyc_status: {
          [Op.in]: ['pending', 'review']
        }
      },
      include: [
        {
          model: User,
          attributes: ['fname', 'lname', 'email', 'phone']
        },
        {
          model: AccountHolder,
          include: [
            {
              model: Account,
              attributes: ['id', 'acc_no', 'acc_type', 'balance', 'status']
            }
          ]
        },
        {
          model: Loan,
          attributes: ['id', 'loan_type', 'principal_amount', 'status']
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(customers.map(buildCustomerPayload));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authorize('loan_officer'), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['fname', 'lname', 'email', 'phone']
        },
        {
          model: AccountHolder,
          include: [
            {
              model: Account,
              attributes: ['id', 'acc_no', 'acc_type', 'balance', 'status']
            }
          ]
        },
        {
          model: Loan,
          attributes: ['id', 'loan_type', 'principal_amount', 'status']
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(buildCustomerPayload(customer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/kyc', authorize('loan_officer'), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const nextStatus = String(req.body.status || 'verified').toLowerCase();
    customer.kyc_status = nextStatus;
    await customer.save();

    res.json({ message: 'KYC updated', status: customer.kyc_status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;