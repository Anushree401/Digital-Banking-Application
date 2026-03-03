'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Offer.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    valid_from: DataTypes.DATE,
    valid_to: DataTypes.DATE,
    offer_type: DataTypes.STRING,
    eligibility_criteria: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Offer',
  });
  return Offer;
};