'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const FixedDeposit = sequelize.define('FixedDeposit', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    linked_account_id: {
      type: DataTypes.INTEGER,
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

    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },

    maturity_date: {
      type: DataTypes.DATE,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }

  }, {});

  FixedDeposit.associate = function(models) {

    // each FD belongs to one Customer
    FixedDeposit.belongsTo(models.Customer, {
      foreignKey: 'customer_id'
    });

    // each FD is linked to one Account
    FixedDeposit.belongsTo(models.Account, {
      foreignKey: 'linked_account_id'
    });

  };

  return FixedDeposit;
};