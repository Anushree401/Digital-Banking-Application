'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const IndividualProfile = sequelize.define('IndividualProfile', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    dob: {
      type: DataTypes.DATE,
      allowNull: false
    },

    occupation: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {});

  IndividualProfile.associate = function(models) {

    // each IndividualProfile belongs to one Customer
    IndividualProfile.belongsTo(models.Customer, {
      foreignKey: 'customer_id'
    });

  };

  return IndividualProfile;
};