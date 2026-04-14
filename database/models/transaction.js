'use strict';

module.exports = (sequelize, DataTypes) => {

  const Transaction = sequelize.define('Transaction', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    from_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true   // system transactions allowed
    },

    to_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true   // bills / FD / deposits
    },

    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },

    transaction_type: {
      type: DataTypes.STRING,   // 'Debit', 'Credit'
      allowNull: false
    },

    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: 'success'
    },

    description: {
      type: DataTypes.STRING   // "FD Created", "Bill Payment", etc.
    }

  }, {});

  Transaction.associate = function(models) {

    Transaction.belongsTo(models.Account, {
      foreignKey: 'from_account_id',
      as: 'fromAccount'
    });

    Transaction.belongsTo(models.Account, {
      foreignKey: 'to_account_id',
      as: 'toAccount'
    });

  };

  return Transaction;
};