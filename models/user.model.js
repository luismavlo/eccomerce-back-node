const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const User = db.define('user', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
})

module.exports = User