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
        where: { customer_id: customer.id },
        order: [['createdAt', 'DESC']]
      });

      // Calculate EMI for each loan if not already set
      const processedLoans = loans.map(loan => {
        const principal = Number(loan.principal_amount);
        const rate = Number(loan.interest_rate) / 100 / 12;
        const tenure = Number(loan.tenure_months);
        
        let emiAmount = loan.emi_amount;
        if (!emiAmount) {
          emiAmount = rate > 0 
            ? (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1)
            : (principal / tenure);
        }

        const paidMonths = loan.paid_months || 0;
        const outstanding = loan.outstanding_amount !== null 
          ? Number(loan.outstanding_amount)
          : (principal - (emiAmount * paidMonths));

        return {
          id: loan.id,
          loan_type: loan.loan_type,
          principal_amount: principal,
          interest_rate: Number(loan.interest_rate),
          tenure_months: tenure,
          status: loan.status,
          paid_months: paidMonths,
          emi_amount: parseFloat(emiAmount.toFixed(2)),
          outstanding_amount: parseFloat(outstanding.toFixed(2)),
          createdAt: loan.createdAt,
          updatedAt: loan.updatedAt
        };
      });

      return res.json(processedLoans);
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
          emi_amount: loan.emi_amount,
          outstanding_amount: loan.outstanding_amount,
          status: loan.status,
          approved_by: loan.approved_by,
          applied_at: loan.createdAt
        };
      });

      return res.json(mapped);
    } else {
      // Investors and other roles get empty
      return res.json([]);
    }

  } catch (err) {
    console.error('Loans fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { principal_amount, tenure_months, loan_type } = req.body;

    // Validate required fields
    if (!principal_amount || !tenure_months || !loan_type) {
      return res.status(400).json({ error: 'Missing required fields: principal_amount, tenure_months, loan_type' });
    }

    if (isNaN(principal_amount) || Number(principal_amount) <= 0) {
      return res.status(400).json({ error: 'Principal amount must be a positive number' });
    }

    if (isNaN(tenure_months) || Number(tenure_months) <= 0) {
      return res.status(400).json({ error: 'Tenure must be a positive number' });
    }

    // Get customer from logged-in user
    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Set default interest rate based on loan type (can be customized later)
    const interestRateMap = {
      'personal': 12.0,
      'home': 8.5,
      'business': 10.0,
      'education': 7.5,
      'vehicle': 9.0
    };

    const interestRate = interestRateMap[loan_type.toLowerCase()] || 10.0;

    // Calculate EMI
    const principal = Number(principal_amount);
    const tenure = Number(tenure_months);
    const rate = interestRate / 100 / 12; // monthly interest rate
    
    let emiAmount = principal / tenure; // simple EMI
    if (rate > 0) {
      emiAmount = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    }

    // Create the loan application
    const loan = await Loan.create({
      customer_id: customer.id,
      loan_type: loan_type,
      principal_amount: principal,
      interest_rate: interestRate,
      tenure_months: tenure,
      status: 'pending',
      paid_months: 0,
      outstanding_amount: principal,
      emi_amount: emiAmount
    });

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan: {
        id: loan.id,
        loan_type: loan.loan_type,
        principal_amount: loan.principal_amount,
        interest_rate: loan.interest_rate,
        tenure_months: loan.tenure_months,
        emi_amount: emiAmount.toFixed(2),
        status: loan.status,
        applied_at: loan.createdAt
      }
    });
  } catch (err) {
    console.error('Loan application error:', err);
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

router.post('/pay', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { loan_id, amount } = req.body;

    if (!loan_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields: loan_id, amount' });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Payment amount must be a positive number' });
    }

    const loan = await Loan.findByPk(loan_id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Verify customer owns this loan
    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (!customer || loan.customer_id !== customer.id) {
      return res.status(403).json({ error: 'Unauthorized - you can only pay your own loans' });
    }

    const paymentAmount = Number(amount);
    const emiAmount = Number(loan.emi_amount || loan.principal_amount / loan.tenure_months);
    const outstanding = Number(loan.outstanding_amount || loan.principal_amount);

    if (paymentAmount > outstanding) {
      return res.status(400).json({ error: `Payment cannot exceed outstanding amount of $${outstanding.toFixed(2)}` });
    }

    // Update loan
    loan.paid_months = (loan.paid_months || 0) + 1;
    loan.outstanding_amount = Math.max(0, outstanding - paymentAmount);
    
    if (loan.outstanding_amount <= 0) {
      loan.status = 'closed';
    }

    await loan.save();

    res.json({
      message: 'Payment processed successfully',
      loan: {
        id: loan.id,
        paid_months: loan.paid_months,
        outstanding_amount: loan.outstanding_amount,
        status: loan.status
      }
    });
  } catch (err) {
    console.error('Loan payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/schedule', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const loan = await Loan.findByPk(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Verify customer owns this loan
    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (customer && loan.customer_id !== customer.id && req.session.user.role === 'customer') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const principal = Number(loan.principal_amount);
    const ratePerAnnum = Number(loan.interest_rate);
    const tenure = Number(loan.tenure_months);
    const monthlyRate = ratePerAnnum / 12 / 100;

    let emiAmount = loan.emi_amount;
    if (!emiAmount) {
      emiAmount = monthlyRate > 0
        ? (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
        : (principal / tenure);
    }

    // Generate EMI schedule
    const schedule = [];
    let remainingBalance = principal;
    const paidMonths = loan.paid_months || 0;

    for (let month = 1; month <= tenure; month++) {
      const interestAmount = remainingBalance * monthlyRate;
      const principalAmount = emiAmount - interestAmount;
      remainingBalance -= principalAmount;

      schedule.push({
        month: month,
        emi: parseFloat(emiAmount.toFixed(2)),
        principal: parseFloat(principalAmount.toFixed(2)),
        interest: parseFloat(interestAmount.toFixed(2)),
        balance: parseFloat(Math.max(0, remainingBalance).toFixed(2)),
        paid: month <= paidMonths
      });
    }

    res.json({
      loan: {
        id: loan.id,
        type: loan.loan_type,
        principal_amount: principal,
        interest_rate: ratePerAnnum,
        tenure_months: tenure,
        emi_amount: parseFloat(emiAmount.toFixed(2)),
        status: loan.status,
        paid_months: paidMonths
      },
      schedule: schedule
    });
  } catch (err) {
    console.error('Loan schedule error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/payoff', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { loan_id } = req.body;

    if (!loan_id) {
      return res.status(400).json({ error: 'Loan ID is required' });
    }

    const loan = await Loan.findByPk(loan_id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Verify customer owns this loan
    const customer = await Customer.findOne({
      where: { user_id: req.session.user.id }
    });

    if (!customer || loan.customer_id !== customer.id) {
      return res.status(403).json({ error: 'Unauthorized - you can only payoff your own loans' });
    }

    if (loan.status === 'closed') {
      return res.status(400).json({ error: 'Loan is already closed' });
    }

    const outstandingAmount = Number(loan.outstanding_amount || loan.principal_amount);

    // Calculate early payoff fee (2% of outstanding amount for loans with remaining tenure > 6 months)
    const remainingMonths = loan.tenure_months - (loan.paid_months || 0);
    let payoffFee = 0;

    if (remainingMonths > 6) {
      payoffFee = outstandingAmount * 0.02; // 2% early payoff fee
    }

    const totalPayoffAmount = outstandingAmount + payoffFee;

    // Update loan status to closed
    loan.status = 'closed';
    loan.outstanding_amount = 0;
    loan.paid_months = loan.tenure_months; // Mark as fully paid
    await loan.save();

    res.json({
      message: 'Early payoff completed successfully',
      loan: {
        id: loan.id,
        status: loan.status,
        outstanding_amount: loan.outstanding_amount,
        paid_months: loan.paid_months
      },
      payoff_details: {
        outstanding_amount: outstandingAmount,
        payoff_fee: payoffFee,
        total_amount: totalPayoffAmount
      }
    });
  } catch (err) {
    console.error('Early payoff error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;