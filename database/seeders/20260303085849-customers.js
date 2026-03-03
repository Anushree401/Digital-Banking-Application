'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Customers', [
      {
        user_id: 1,
        customer_type: 'individual',
        kyc_status: 'verified',
        pan_number: 'ABCDE1234F',
        adhaar_number: '123412341234',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Customers', null, {});
  }
};