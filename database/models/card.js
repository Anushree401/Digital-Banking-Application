'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const Card = sequelize.define('Card', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    card_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    card_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false
    },

    cvv_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }

  }, {});

  Card.associate = function(models) {

    // each Card belongs to one Account
    Card.belongsTo(models.Account, {
      foreignKey: 'account_id'
    });

  };

  return Card;
};