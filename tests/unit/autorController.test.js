const request = require('supertest');
const app = require('../../app');
const { Autor, Livro, sequelize } = require('../../src/models');

describe('Autor Controller', () => {
  beforeAll(async () => {
    // Sincronizar banco de dados para testes
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Limpar banco de dados após os testes
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar tabelas antes de cada teste
    await Livro.destroy({ where: {}, truncate: true });
    await Autor.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/autores', () => {
    it('deve criar um novo autor com dados válidos', async () => {
      const novoAutor = {
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        dataNascimento: '1980-05-15',
        nacionalidade: 'Brasileira',
        biografia: 'Escritor brasileiro renomado.'
      };

      const response = await request(app)
        .post('/api/autores')
        .send(novoAutor)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(novoAutor.nome);
      expect(response.body.email).toBe(novoAutor.email);
      expect(response.body.dataNascimento).toBe(novoAutor.dataNascimento);
      expect(response.body.nacionalidade).toBe(novoAutor.nacionalidade);
      expect(response.body.biografia).toBe(novoAutor.biografia);
    });

    it('deve criar um autor sem biografia', async () => {
      const novoAutor = {
        nome: 'Maria Santos',
        email: 'maria@exemplo.com',
        dataNascimento: '1975-12-20',
        nacionalidade: 'Portuguesa'
      };

      const response = await request(app)
        .post('/api/autores')
        .send(novoAutor)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(novoAutor.nome);
      expect(response.body.biografia).toBeNull();
    });

    it('deve retornar erro 400 quando campos obrigatórios estão ausentes', async () => {
      const autorIncompleto = {
        nome: 'Autor Incompleto'
        // Faltam campos obrigatórios
      };

      const response = await request(app)
        .post('/api/autores')
        .send(autorIncompleto)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('campos obrigatórios');
    });

    it('deve retornar erro 400 quando email já existe', async () => {
      const autor1 = {
        nome: 'Primeiro Autor',
        email: 'mesmo@email.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      };

      const autor2 = {
        nome: 'Segundo Autor',
        email: 'mesmo@email.com', // Mesmo email
        dataNascimento: '1985-01-01',
        nacionalidade: 'Argentina'
      };

      // Criar primeiro autor
      await request(app)
        .post('/api/autores')
        .send(autor1)
        .expect(201);

      // Tentar criar segundo autor com mesmo email
      const response = await request(app)
        .post('/api/autores')
        .send(autor2)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Email já existe');
    });

    it('deve retornar erro 400 com email inválido', async () => {
      const autorEmailInvalido = {
        nome: 'Autor Teste',
        email: 'email-invalido',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      };

      const response = await request(app)
        .post('/api/autores')
        .send(autorEmailInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 com data de nascimento no futuro', async () => {
      const autorDataFutura = {
        nome: 'Autor Teste',
        email: 'autor@teste.com',
        dataNascimento: '2030-01-01', // Data no futuro
        nacionalidade: 'Brasileira'
      };

      const response = await request(app)
        .post('/api/autores')
        .send(autorDataFutura)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/autores', () => {
    it('deve retornar lista vazia quando não há autores', async () => {
      const response = await request(app)
        .get('/api/autores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('deve retornar lista de autores', async () => {
      // Criar alguns autores
      await Autor.create({
        nome: 'Autor 1',
        email: 'autor1@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      await Autor.create({
        nome: 'Autor 2',
        email: 'autor2@teste.com',
        dataNascimento: '1975-05-15',
        nacionalidade: 'Portuguesa'
      });

      const response = await request(app)
        .get('/api/autores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('nome');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('livros');
    });
  });

  describe('GET /api/autores/:id', () => {
    it('deve retornar um autor específico', async () => {
      const autor = await Autor.create({
        nome: 'Autor Específico',
        email: 'especifico@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira',
        biografia: 'Biografia do autor específico'
      });

      const response = await request(app)
        .get(`/api/autores/${autor.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', autor.id);
      expect(response.body).toHaveProperty('nome', 'Autor Específico');
      expect(response.body).toHaveProperty('biografia', 'Biografia do autor específico');
      expect(response.body).toHaveProperty('livros');
    });

    it('deve retornar erro 404 quando autor não existe', async () => {
      const response = await request(app)
        .get('/api/autores/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .get('/api/autores/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID inválido');
    });
  });

  describe('PUT /api/autores/:id', () => {
    it('deve atualizar um autor existente', async () => {
      const autor = await Autor.create({
        nome: 'Autor Original',
        email: 'original@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      const dadosAtualizacao = {
        nome: 'Autor Atualizado',
        nacionalidade: 'Portuguesa',
        biografia: 'Nova biografia'
      };

      const response = await request(app)
        .put(`/api/autores/${autor.id}`)
        .send(dadosAtualizacao)
        .expect(200);

      expect(response.body).toHaveProperty('nome', 'Autor Atualizado');
      expect(response.body).toHaveProperty('nacionalidade', 'Portuguesa');
      expect(response.body).toHaveProperty('biografia', 'Nova biografia');
      expect(response.body).toHaveProperty('email', 'original@teste.com'); // Não alterado
    });

    it('deve retornar erro 404 quando autor não existe', async () => {
      const response = await request(app)
        .put('/api/autores/99999')
        .send({ nome: 'Novo Nome' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const autor = await Autor.create({
        nome: 'Autor Para Atualizar',
        email: 'atualizar@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      const dadosInvalidos = {
        email: 'email-invalido' // Email inválido
      };

      const response = await request(app)
        .put(`/api/autores/${autor.id}`)
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/autores/:id', () => {
    it('deve deletar um autor sem livros associados', async () => {
      const autor = await Autor.create({
        nome: 'Autor Para Deletar',
        email: 'deletar@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      const response = await request(app)
        .delete(`/api/autores/${autor.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('deletado com sucesso');

      // Verificar se o autor foi realmente deletado
      const autorVerificacao = await Autor.findByPk(autor.id);
      expect(autorVerificacao).toBeNull();
    });

    it('deve retornar erro 400 quando autor tem livros associados', async () => {
      const autor = await Autor.create({
        nome: 'Autor Com Livros',
        email: 'comlivros@teste.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      // Criar um livro associado ao autor
      await Livro.create({
        titulo: 'Livro do Autor',
        isbn: '978-3-16-148410-0',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: autor.id
      });

      const response = await request(app)
        .delete(`/api/autores/${autor.id}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('livros associados');
      expect(response.body).toHaveProperty('livrosAssociados', 1);
    });

    it('deve retornar erro 404 quando autor não existe', async () => {
      const response = await request(app)
        .delete('/api/autores/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .delete('/api/autores/abc')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ID inválido');
    });
  });
});

