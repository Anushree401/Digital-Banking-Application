'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Investors', [
      {
        user_id: 3,
        investment_balance: 500000,
        risk_profile: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Investors', null, {});
  }
};