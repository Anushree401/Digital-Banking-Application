'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    fname: {
      type: DataTypes.STRING,
      allowNull: false
    },

    lname: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }

  }, {});

  User.associate = function(models) {

    // 1:1 Customer
    User.hasOne(models.Customer, {
      foreignKey: 'user_id'
    });

    // 1:1 LoanOfficer
    User.hasOne(models.LoanOfficer, {
      foreignKey: 'user_id'
    });

    // 1:1 Investor
    User.hasOne(models.Investor, {
      foreignKey: 'user_id'
    });

  };

  return User;
};