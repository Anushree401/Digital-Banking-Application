'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoanOfficer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LoanOfficer.init({
    user_id: DataTypes.INTEGER,
    employee_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LoanOfficer',
  });
  return LoanOfficer;
};