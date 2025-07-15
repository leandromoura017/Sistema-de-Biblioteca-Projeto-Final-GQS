const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Autor = sequelize.define('Autor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  dataNascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0], // Não pode ser no futuro
    },
  },
  nacionalidade: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'autores',
  timestamps: true,
});

module.exports = Autor;

