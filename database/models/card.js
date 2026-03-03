'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Card.init({
    account_id: DataTypes.INTEGER,
    card_number: DataTypes.STRING,
    card_type: DataTypes.STRING,
    expiry_date: DataTypes.DATE,
    cvv_hash: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};