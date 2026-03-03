'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Loans', [
      {
        customer_id: 1,
        loan_type: 'personal',
        principal_amount: 50000,
        interest_rate: 10.5,
        tenure_months: 12,
        status: 'approved',
        approved_by: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Loans', null, {});
  }
};