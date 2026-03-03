'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const BusinessProfile = sequelize.define('BusinessProfile', {

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

    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    gst_number: {
      type: DataTypes.STRING,
      allowNull: false
    },

    reg_no: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {});

  BusinessProfile.associate = function(models) {

    // each BusinessProfile belongs to one Customer
    BusinessProfile.belongsTo(models.Customer, {
      foreignKey: 'customer_id'
    });

  };

  return BusinessProfile;
};