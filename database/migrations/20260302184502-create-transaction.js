'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Accounts', key: 'id' }
      },
      to_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Accounts', key: 'id' }
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'success'
      },
      timestamp: {
        type: Sequelize.DATE
      },
      description: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};