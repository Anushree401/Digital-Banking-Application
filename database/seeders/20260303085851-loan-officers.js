'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('LoanOfficers', [
      {
        user_id: 2,
        employee_id: 'EMP001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LoanOfficers', null, {});
  }
};