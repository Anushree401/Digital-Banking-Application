'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const LoanOfficer = sequelize.define('LoanOfficer', {

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

    employee_id: {
      type: DataTypes.STRING,
      allowNull: false
    }

  }, {});

  LoanOfficer.associate = function(models) {

    // each LoanOfficer belongs to one User
    LoanOfficer.belongsTo(models.User, {
      foreignKey: 'user_id'
    });

    // one LoanOfficer can approve many Loans
    LoanOfficer.hasMany(models.Loan, {
      foreignKey: 'approved_by'
    });

  };

  return LoanOfficer;
};