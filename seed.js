const {
  sequelize,
  User,
  Customer,
  IndividualProfile,
  Account,
  AccountHolder,
  Transaction,
  Card,
  LoanOfficer,
  Loan,
  Investor,
  Offer
} = require('./database/models');

const bcrypt = require('bcrypt');

async function seed() {
  try {
    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();

    const tables = [
      'Offers',
      'Loans',
      'Cards',
      'Transactions',
      'Accounts',
      'AccountHolders',
      'FixedDeposits',
      'Investors',
      'LoanOfficers',
      'BusinessProfiles',
      'IndividualProfiles',
      'Customers',
      'Users'
    ];

    for (const table of tables) {
      await queryInterface.bulkDelete(table, null, {});
    }

    console.log("Seeding started...");

    // USERS
    const password = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      fname: 'Anuii',
      lname: 'Dev',
      email: 'anuii@mail.com',
      phone: '9999999991',
      password_hash: password,
      role: 'customer',
      created_at: new Date()
    });

    const user2 = await User.create({
      fname: 'Investor',
      lname: 'One',
      email: 'investor@mail.com',
      phone: '9999999992',
      password_hash: password,
      role: 'investor',
      created_at: new Date()
    });

    const officerUser = await User.create({
      fname: 'Loan',
      lname: 'Officer',
      email: 'officer@mail.com',
      phone: '9999999993',
      password_hash: password,
      role: 'loan_officer',
      created_at: new Date()
    });

    // CUSTOMER
    const customer = await Customer.create({
      user_id: user1.id,
      customer_type: 'individual',
      kyc_status: 'verified',
      pan_number: 'ABCDE1234F',
      adhaar_number: '123456789012'
    });

    // PROFILE
    await IndividualProfile.create({
      customer_id: customer.id,
      dob: new Date('2000-01-01'),
      occupation: 'Student'
    });

    // ACCOUNT
    const account = await Account.create({
      acc_no: 'ACC1001',
      acc_type: 'savings',
      balance: 50000,
      status: 'active',
      opened_at: new Date()
    });

    const account2 = await Account.create({
      acc_no: 'ACC2002',
      acc_type: 'savings',
      balance: 30000,
      status: 'active',
      opened_at: new Date()
    });

    const billerAccount = await Account.create({
      acc_no: 'BILLER000',
      acc_type: 'system',
      balance: 0,
      status: 'active',
      opened_at: new Date()
    });

    const cashAccount = await Account.create({
      acc_no: 'CASH000',
      acc_type: 'system',
      balance: 0,
      status: 'active',
      opened_at: new Date()
    });

    await Account.create({
      acc_no: 'FD000',
      acc_type: 'system',
      balance: 0,
      status: 'active',
      opened_at: new Date()
    });

    await AccountHolder.create({
      account_id: account2.id,
      customer_id: customer.id,
      is_primary: false
    });

    // ACCOUNT HOLDER
    await AccountHolder.create({
      account_id: account.id,
      customer_id: customer.id,
      is_primary: true
    });

    // TRANSACTION (SELF DEPOSIT)
    await Transaction.create({
      from_account_id: account.id,
      to_account_id: account.id,
      amount: 5000,
      transaction_type: 'deposit',
      timestamp: new Date(),
      status: 'success',
      description: 'Initial deposit'
    });

    // CARD
    await Card.create({
      account_id: account.id,
      card_number: '1234567812345678',
      card_type: 'debit',
      expiry_date: new Date('2030-01-01'),
      cvv_hash: await bcrypt.hash('123', 10),
      status: 'active'
    });

    // LOAN OFFICER
    const officer = await LoanOfficer.create({
      user_id: officerUser.id,
      employee_id: 'EMP001'
    });

    // LOAN
    await Loan.create({
      customer_id: customer.id,
      loan_type: 'personal',
      principal_amount: 20000,
      interest_rate: 10,
      tenure_months: 12,
      status: 'approved',
      approved_by: officer.id
    });

    // INVESTOR
    await Investor.create({
      user_id: user2.id,
      investment_balance: 100000,
      risk_profile: 'medium'
    });

    // OFFER
    await Offer.create({
      title: 'New Year Loan Offer',
      description: 'Low interest personal loan',
      valid_from: new Date(),
      valid_to: new Date('2026-12-31'),
      offer_type: 'loan',
      eligibility_criteria: 'KYC verified users only'
    });

    console.log("SEEDING COMPLETED");
    process.exit();

  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();