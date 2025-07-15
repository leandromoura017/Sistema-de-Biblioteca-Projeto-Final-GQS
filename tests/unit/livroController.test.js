const request = require('supertest');
const app = require('../../app');
const { Livro, Autor, sequelize } = require('../../src/models');

describe('Livro Controller', () => {
  let autorId;

  beforeAll(async () => {
    // Sincronizar banco de dados para testes
    await sequelize.sync({ force: true });
    
    // Criar um autor para usar nos testes
    const autor = await Autor.create({
      nome: 'Autor Teste',
      email: 'autor@teste.com',
      dataNascimento: '1980-01-01',
      nacionalidade: 'Brasileira'
    });
    autorId = autor.id;
  });

  afterAll(async () => {
    // Limpar banco de dados após os testes
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar tabela de livros antes de cada teste
    await Livro.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/livros', () => {
    it('deve criar um novo livro com dados válidos', async () => {
      const novoLivro = {
        titulo: 'Livro Teste',
        isbn: '978-3-16-148410-0',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: autorId
      };

      const response = await request(app)
        .post('/api/livros')
        .send(novoLivro)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe(novoLivro.titulo);
      expect(response.body.isbn).toBe(novoLivro.isbn);
      expect(response.body.anoPublicacao).toBe(novoLivro.anoPublicacao);
      expect(response.body.genero).toBe(novoLivro.genero);
      expect(response.body.numeroPaginas).toBe(novoLivro.numeroPaginas);
      expect(response.body.autorId).toBe(autorId);
    });

    it('deve criar um livro sem autor', async () => {
      const novoLivro = {
        titulo: 'Livro Sem Autor',
        isbn: '978-3-16-148410-1',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 250
      };

      const response = await request(app)
        .post('/api/livros')
        .send(novoLivro)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe(novoLivro.titulo);
      expect(response.body.autorId).toBeNull();
    });

    it('deve retornar erro 400 quando campos obrigatórios estão ausentes', async () => {
      const livroIncompleto = {
        titulo: 'Livro Incompleto'
        // Faltam campos obrigatórios
      };

      const response = await request(app)
        .post('/api/livros')
        .send(livroIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('campos obrigatórios');
    });

    it('deve retornar erro 400 quando ISBN já existe', async () => {
      const livro1 = {
        titulo: 'Primeiro Livro',
        isbn: '978-3-16-148410-2',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300
      };

      const livro2 = {
        titulo: 'Segundo Livro',
        isbn: '978-3-16-148410-2', // Mesmo ISBN
        anoPublicacao: 2023,
        genero: 'Romance',
        numeroPaginas: 250
      };

      // Criar primeiro livro
      await request(app)
        .post('/api/livros')
        .send(livro1)
        .expect(201);

      // Tentar criar segundo livro com mesmo ISBN
      const response = await request(app)
        .post('/api/livros')
        .send(livro2)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ISBN já existe');
    });

    it('deve retornar erro 400 quando autor não existe', async () => {
      const livroComAutorInexistente = {
        titulo: 'Livro Teste',
        isbn: '978-3-16-148410-3',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: 99999 // ID que não existe
      };

      const response = await request(app)
        .post('/api/livros')
        .send(livroComAutorInexistente)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Autor não encontrado');
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const livroInvalido = {
        titulo: '', // Título vazio
        isbn: '123', // ISBN inválido
        anoPublicacao: 3000, // Ano no futuro
        genero: 'Ficção',
        numeroPaginas: -10 // Número negativo
      };

      const response = await request(app)
        .post('/api/livros')
        .send(livroInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/livros', () => {
    it('deve retornar lista vazia quando não há livros', async () => {
      const response = await request(app)
        .get('/api/livros')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('deve retornar lista de livros', async () => {
      // Criar alguns livros
      await Livro.create({
        titulo: 'Livro 1',
        isbn: '978-3-16-148410-4',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: autorId
      });

      await Livro.create({
        titulo: 'Livro 2',
        isbn: '978-3-16-148410-5',
        anoPublicacao: 2022,
        genero: 'Romance',
        numeroPaginas: 250
      });

      const response = await request(app)
        .get('/api/livros')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('titulo');
      expect(response.body[0]).toHaveProperty('isbn');
      expect(response.body[0]).toHaveProperty('autor');
    });
  });

  describe('GET /api/livros/:id', () => {
    it('deve retornar um livro específico', async () => {
      const livro = await Livro.create({
        titulo: 'Livro Específico',
        isbn: '978-3-16-148410-6',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: autorId
      });

      const response = await request(app)
        .get(`/api/livros/${livro.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', livro.id);
      expect(response.body).toHaveProperty('titulo', 'Livro Específico');
      expect(response.body).toHaveProperty('autor');
      expect(response.body.autor).toHaveProperty('nome', 'Autor Teste');
    });

    it('deve retornar erro 404 quando livro não existe', async () => {
      const response = await request(app)
        .get('/api/livros/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .get('/api/livros/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID inválido');
    });
  });

  describe('PUT /api/livros/:id', () => {
    it('deve atualizar um livro existente', async () => {
      const livro = await Livro.create({
        titulo: 'Livro Original',
        isbn: '978-3-16-148410-7',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300
      });

      const dadosAtualizacao = {
        titulo: 'Livro Atualizado',
        genero: 'Romance'
      };

      const response = await request(app)
        .put(`/api/livros/${livro.id}`)
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body).toHaveProperty('titulo', 'Livro Atualizado');
      expect(response.body).toHaveProperty('genero', 'Romance');
      expect(response.body).toHaveProperty('isbn', '978-3-16-148410-7'); // Não alterado
    });

    it('deve retornar erro 404 quando livro não existe', async () => {
      const response = await request(app)
        .put('/api/livros/99999')
        .send({ titulo: 'Novo Título' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const livro = await Livro.create({
        titulo: 'Livro Para Atualizar',
        isbn: '978-3-16-148410-8',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300
      });

      const dadosInvalidos = {
        anoPublicacao: 3000 // Ano no futuro
      };

      const response = await request(app)
        .put(`/api/livros/${livro.id}`)
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/livros/:id', () => {
    it('deve deletar um livro existente', async () => {
      const livro = await Livro.create({
        titulo: 'Livro Para Deletar',
        isbn: '978-3-16-148410-9',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300
      });

      const response = await request(app)
        .delete(`/api/livros/${livro.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('deletado com sucesso');

      // Verificar se o livro foi realmente deletado
      const livroVerificacao = await Livro.findByPk(livro.id);
      expect(livroVerificacao).toBeNull();
    });

    it('deve retornar erro 404 quando livro não existe', async () => {
      const response = await request(app)
        .delete('/api/livros/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .delete('/api/livros/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID inválido');
    });
  });
});

