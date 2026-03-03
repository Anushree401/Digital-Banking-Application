'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Transactions', [
      {
        from_account_id: 1,
        to_account_id: 1,
        amount: 1000,
        transaction_type: 'credit',
        timestamp: new Date(),
        status: 'success',
        description: 'Initial credit',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  }
};