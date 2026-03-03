'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('AccountHolders', [
      {
        account_id: 1,
        customer_id: 1,
        is_primary: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AccountHolders', null, {});
  }
};