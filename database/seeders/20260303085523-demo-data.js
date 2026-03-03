'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    // USERS
    await queryInterface.bulkInsert('Users', [
      {
        fname: 'Anu',
        lname: 'Customer',
        email: 'customer@test.com',
        phone: '9999999999',
        password_hash: 'hashed_password',
        role: 'customer',
        created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fname: 'Loan',
        lname: 'Officer',
        email: 'officer@test.com',
        phone: '8888888888',
        password_hash: 'hashed_password',
        role: 'loan_officer',
        created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};