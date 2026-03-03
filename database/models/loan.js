'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const Loan = sequelize.define('Loan', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    loan_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    principal_amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },

    interest_rate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },

    tenure_months: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },

    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }

  }, {});

  Loan.associate = function(models) {

    // each Loan belongs to one Customer
    Loan.belongsTo(models.Customer, {
      foreignKey: 'customer_id'
    });

    // each Loan may be approved by one LoanOfficer
    Loan.belongsTo(models.LoanOfficer, {
      foreignKey: 'approved_by'
    });

  };

  return Loan;
};