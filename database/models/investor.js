'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const Investor = sequelize.define('Investor', {

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

    investment_balance: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue: 0
    },

    risk_profile: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {});

  Investor.associate = function(models) {

    // each Investor belongs to one User
    Investor.belongsTo(models.User, {
      foreignKey: 'user_id'
    });

  };

  return Investor;
};