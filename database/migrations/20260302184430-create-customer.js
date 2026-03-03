'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        customer_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        kyc_status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'pending'
        },
        pan_number: {
          type: Sequelize.STRING,
          allowNull: false
        },
        adhaar_number: {
          type: Sequelize.STRING,
          allowNull: false
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
    await queryInterface.dropTable('Customers');
  }
};