'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const AccountHolder = sequelize.define('AccountHolder', {

    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }

  }, {});

  AccountHolder.associate = function(models) {

    // each account holder belongs to one account
    AccountHolder.belongsTo(models.Account, {
      foreignKey: 'account_id'
    });

    // each account holder belongs to one customer
    AccountHolder.belongsTo(models.Customer, {
      foreignKey: 'customer_id'
    });

  };

  return AccountHolder;
};