const { sequelize } = require('../src/models');

// Configuração global para testes
beforeAll(async () => {
  // Configurar timeout para testes
  jest.setTimeout(30000);
});

afterAll(async () => {
  // Fechar conexão com banco de dados
  if (sequelize) {
    await sequelize.close();
  }
});

