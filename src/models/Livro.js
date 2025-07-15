const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Livro = sequelize.define('Livro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [10, 17], // ISBN-10 ou ISBN-13
    },
  },
  anoPublicacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1000,
      max: new Date().getFullYear(),
    },
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  numeroPaginas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
    },
  },
}, {
  tableName: 'livros',
  timestamps: true,
});

module.exports = Livro;

