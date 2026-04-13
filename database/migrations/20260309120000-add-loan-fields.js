'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Loans', 'paid_months', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Loans', 'outstanding_amount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true
    });

    await queryInterface.addColumn('Loans', 'emi_amount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Loans', 'paid_months');
    await queryInterface.removeColumn('Loans', 'outstanding_amount');
    await queryInterface.removeColumn('Loans', 'emi_amount');
  }
};
