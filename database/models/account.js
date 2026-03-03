'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize,DataTypes) => {

  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    acc_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    acc_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {});

  Account.associate = function(models) {

    // many to many with Customer through AccountHolder (one account can have multiple holders and one customer can hold multiple accounts)
    Account.belongsToMany(models.Customer, {
      through: 'AccountHolder',
      foreignKey: 'account_id',
      otherKey: 'customer_id'
    });

    // transactions (from account)
    Account.hasMany(models.Transaction, {
      foreignKey: 'from_account_id',
      as: 'outgoingTransactions'
    });

    // transactions (to account)
    Account.hasMany(models.Transaction, {
      foreignKey: 'to_account_id',
      as: 'incomingTransactions'
    });

    // cards
    Account.hasMany(models.Card, {
      foreignKey: 'account_id'
    });

    // fixed deposits
    Account.hasMany(models.FixedDeposit, {
      foreignKey: 'linked_account_id'
    });

  };

  return Account;

};