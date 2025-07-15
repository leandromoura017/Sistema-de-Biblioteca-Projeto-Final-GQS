const express = require('express');
const path = require('path');
const { syncDatabase } = require('./src/models');

// Importar rotas
const livroRoutes = require('./src/routes/livroRoutes');
const autorRoutes = require('./src/routes/autorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')));

// Configurar EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Rotas da API
app.use('/api/livros', livroRoutes);
app.use('/api/autores', autorRoutes);

// Rotas para as views
app.get('/', (req, res) => {
  res.render('index', { title: 'Sistema de Biblioteca' });
});

app.get('/livros/novo', (req, res) => {
  res.render('livros/novo', { title: 'Cadastrar Novo Livro' });
});

app.get('/autores/novo', (req, res) => {
  res.render('autores/novo', { title: 'Cadastrar Novo Autor' });
});

app.get('/livros', (req, res) => {
  res.render('livros/lista', { title: 'Lista de Livros' });
});

app.get('/autores', (req, res) => {
  res.render('autores/lista', { title: 'Lista de Autores' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    mensagem: err.message
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await syncDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Iniciar apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = app;

