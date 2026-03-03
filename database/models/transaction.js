'use strict';

const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  const Transaction = sequelize.define('Transaction', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    from_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    to_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },

    transaction_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success'
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {});

  Transaction.associate = function(models) {

    // Sender Account
    Transaction.belongsTo(models.Account, {
      foreignKey: 'from_account_id',
      as: 'fromAccount'
    });

    // Receiver Account
    Transaction.belongsTo(models.Account, {
      foreignKey: 'to_account_id',
      as: 'toAccount'
    });

  };

  return Transaction;
};'use strict';

module.exports = (sequelize, DataTypes) => {

  const Transaction = sequelize.define('Transaction', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    from_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    to_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },

    transaction_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success'
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true
    }

  }, {});

  Transaction.associate = function(models) {

    // Sender Account
    Transaction.belongsTo(models.Account, {
      foreignKey: 'from_account_id',
      as: 'fromAccount'
    });

    // Receiver Account
    Transaction.belongsTo(models.Account, {
      foreignKey: 'to_account_id',
      as: 'toAccount'
    });

  };

  return Transaction;
};