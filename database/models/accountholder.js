'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccountHolder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AccountHolder.init({
    account_id: DataTypes.INTEGER,
    customer_id: DataTypes.INTEGER,
    is_primary: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AccountHolder',
  });
  return AccountHolder;
};