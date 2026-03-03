'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Investor.init({
    user_id: DataTypes.INTEGER,
    investment_balance: DataTypes.DECIMAL,
    risk_profile: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Investor',
  });
  return Investor;
};