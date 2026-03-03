'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Loan.init({
    customer_id: DataTypes.INTEGER,
    loan_type: DataTypes.STRING,
    principal_amount: DataTypes.DECIMAL,
    interest_rate: DataTypes.DECIMAL,
    tenure_months: DataTypes.INTEGER,
    status: DataTypes.STRING,
    approved_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Loan',
  });
  return Loan;
};