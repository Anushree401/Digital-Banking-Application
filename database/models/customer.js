'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const Customer = sequelize.define('Customer', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    customer_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    kyc_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },

    pan_number: {
      type: DataTypes.STRING,
      allowNull: false
    },

    adhaar_number: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {});

  Customer.associate = function(models) {

    // 1:1 with User
    Customer.belongsTo(models.User, {
      foreignKey: 'user_id'
    });

    // 1:1 Individual Profile
    Customer.hasOne(models.IndividualProfile, {
      foreignKey: 'customer_id'
    });

    // 1:1 Business Profile
    Customer.hasOne(models.BusinessProfile, {
      foreignKey: 'customer_id'
    });

    // many to many with Account via AccountHolder
    Customer.belongsToMany(models.Account, {
      through: models.AccountHolder,
      foreignKey: 'customer_id',
      otherKey: 'account_id'
    });

    // 1:n Fixed Deposits
    Customer.hasMany(models.FixedDeposit, {
      foreignKey: 'customer_id'
    });

    // 1:n Loans
    Customer.hasMany(models.Loan, {
      foreignKey: 'customer_id'
    });

  };

  return Customer;
};