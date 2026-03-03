'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BusinessProfile.init({
    customer_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    gst_number: DataTypes.STRING,
    reg_no: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BusinessProfile',
  });
  return BusinessProfile;
};