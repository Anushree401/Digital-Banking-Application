'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FixedDeposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FixedDeposit.init({
    customer_id: DataTypes.INTEGER,
    linked_account_id: DataTypes.INTEGER,
    principal_amount: DataTypes.DECIMAL,
    interest_rate: DataTypes.DECIMAL,
    start_date: DataTypes.DATE,
    maturity_date: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FixedDeposit',
  });
  return FixedDeposit;
};