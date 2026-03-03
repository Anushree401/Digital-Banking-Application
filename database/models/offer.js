'use strict';

module.exports = (sequelize, DataTypes) => {

  const Offer = sequelize.define('Offer', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    valid_from: {
      type: DataTypes.DATE,
      allowNull: false
    },

    valid_to: {
      type: DataTypes.DATE,
      allowNull: false
    },

    offer_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    eligibility_criteria: {
      type: DataTypes.TEXT,
      allowNull: false
    }

  }, {});

  Offer.associate = function(models) {

    // Optional: define many-to-many with Customer if you create a junction table
    // Offer.belongsToMany(models.Customer, { through: models.CustomerOffer });

  };

  return Offer;
};