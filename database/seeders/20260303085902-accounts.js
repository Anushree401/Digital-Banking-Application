'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Accounts', [
      {
        acc_no: 'ACC1001',
        acc_type: 'savings',
        balance: 100000,
        status: 'active',
        opened_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Accounts', null, {});
  }
};