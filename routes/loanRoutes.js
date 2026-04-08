const express = require('express');
const router = express.Router();
const { Loan, Customer, User, LoanOfficer } = require('../database/models');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    let loans;

    if (userRole === 'customer') {
      // Customers see only their own loans
      const customer = await Customer.findOne({
        where: { user_id: userId }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      loans = await Loan.findAll({
        where: { customer_id: customer.id }
      });
    } else if (userRole === 'loan_officer') {
      // Loan officers see all loans with customer details
      loans = await Loan.findAll({
        include: [
          {
            model: Customer,
            include: [
              {
                model: User,
                attributes: ['fname', 'lname', 'email', 'phone']
              }
            ],
            attributes: ['id', 'customer_type', 'kyc_status', 'pan_number', 'adhaar_number']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Investors and other roles get empty
      loans = [];
    }

    if (userRole === 'loan_officer') {
      const mapped = loans.map(loan => {
        const customer = loan.Customer || {};
        const customerUser = customer.User || {};

        return {
          id: loan.id,
          customer_id: loan.customer_id,
          customer_name: [customerUser.fname, customerUser.lname].filter(Boolean).join(' ') || `Customer #${loan.customer_id}`,
          customer_email: customerUser.email || '--',
          customer_phone: customerUser.phone || '--',
          kyc_status: customer.kyc_status || '--',
          loan_type: loan.loan_type,
          principal_amount: loan.principal_amount,
          interest_rate: loan.interest_rate,
          tenure_months: loan.tenure_months,
          status: loan.status,
          approved_by: loan.approved_by,
          applied_at: loan.createdAt
        };
      });

      return res.json(mapped);
    }

    res.json(loans);

  } catch (err) {
    console.error('Loans fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/approve/:id', authorize('loan_officer'), async (req, res) => {
  try {
    const loanOfficer = await LoanOfficer.findOne({ where: { user_id: req.session.user.id } });
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    loan.status = 'approved';
    loan.approved_by = loanOfficer ? loanOfficer.id : null;
    await loan.save();

    res.json({ message: 'Loan approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reject/:id', authorize('loan_officer'), async (req, res) => {
  try {
    const loanOfficer = await LoanOfficer.findOne({ where: { user_id: req.session.user.id } });
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    loan.status = 'rejected';
    loan.approved_by = loanOfficer ? loanOfficer.id : null;
    await loan.save();

    res.json({ message: 'Loan rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;