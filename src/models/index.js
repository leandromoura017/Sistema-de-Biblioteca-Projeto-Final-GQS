const sequelize = require('../database/database');
const Livro = require('./Livro');
const Autor = require('./Autor');

// Definir associações entre modelos (se necessário)
// Exemplo: Um livro pode ter um autor, um autor pode ter vários livros
Livro.belongsTo(Autor, { foreignKey: 'autorId', as: 'autor' });
Autor.hasMany(Livro, { foreignKey: 'autorId', as: 'livros' });

// Função para sincronizar o banco de dados
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    await sequelize.sync({ force: false }); // force: true recria as tabelas
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
};

module.exports = {
  sequelize,
  Livro,
  Autor,
  syncDatabase,
};

