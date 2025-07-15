const request = require('supertest');
const app = require('../../app');
const { sequelize, Autor, Livro } = require('../../src/models');

describe('API Integration Tests', () => {
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

  describe('Fluxo completo de CRUD', () => {
    it('deve realizar operações CRUD completas para autor e livro', async () => {
      // 1. Criar um autor
      const novoAutor = {
        nome: 'Machado de Assis',
        email: 'machado@literatura.com',
        dataNascimento: '1839-06-21',
        nacionalidade: 'Brasileira',
        biografia: 'Escritor brasileiro, considerado um dos maiores nomes da literatura nacional.'
      };

      const autorResponse = await request(app)
        .post('/api/autores')
        .send(novoAutor)
        .expect(201);

      const autorId = autorResponse.body.id;
      expect(autorResponse.body.nome).toBe(novoAutor.nome);

      // 2. Listar autores (deve ter 1)
      const autoresResponse = await request(app)
        .get('/api/autores')
        .expect(200);

      expect(autoresResponse.body).toHaveLength(1);
      expect(autoresResponse.body[0].nome).toBe(novoAutor.nome);

      // 3. Criar um livro associado ao autor
      const novoLivro = {
        titulo: 'Dom Casmurro',
        isbn: '978-85-359-0277-5',
        anoPublicacao: 1899,
        genero: 'Romance',
        numeroPaginas: 256,
        autorId: autorId
      };

      const livroResponse = await request(app)
        .post('/api/livros')
        .send(novoLivro)
        .expect(201);

      const livroId = livroResponse.body.id;
      expect(livroResponse.body.titulo).toBe(novoLivro.titulo);
      expect(livroResponse.body.autorId).toBe(autorId);

      // 4. Buscar livro específico (deve incluir dados do autor)
      const livroEspecificoResponse = await request(app)
        .get(`/api/livros/${livroId}`)
        .expect(200);

      expect(livroEspecificoResponse.body.titulo).toBe(novoLivro.titulo);
      expect(livroEspecificoResponse.body.autor).toBeDefined();
      expect(livroEspecificoResponse.body.autor.nome).toBe(novoAutor.nome);

      // 5. Buscar autor específico (deve incluir livros)
      const autorEspecificoResponse = await request(app)
        .get(`/api/autores/${autorId}`)
        .expect(200);

      expect(autorEspecificoResponse.body.nome).toBe(novoAutor.nome);
      expect(autorEspecificoResponse.body.livros).toBeDefined();
      expect(autorEspecificoResponse.body.livros).toHaveLength(1);
      expect(autorEspecificoResponse.body.livros[0].titulo).toBe(novoLivro.titulo);

      // 6. Atualizar livro
      const dadosAtualizacaoLivro = {
        numeroPaginas: 300,
        genero: 'Romance Clássico'
      };

      const livroAtualizadoResponse = await request(app)
        .put(`/api/livros/${livroId}`)
        .send(dadosAtualizacaoLivro)
        .expect(200);

      expect(livroAtualizadoResponse.body.numeroPaginas).toBe(300);
      expect(livroAtualizadoResponse.body.genero).toBe('Romance Clássico');
      expect(livroAtualizadoResponse.body.titulo).toBe(novoLivro.titulo); // Não alterado

      // 7. Atualizar autor
      const dadosAtualizacaoAutor = {
        biografia: 'Joaquim Maria Machado de Assis foi um escritor brasileiro, considerado por muitos críticos, estudiosos, escritores e leitores um dos maiores senão o maior nome da literatura brasileira.'
      };

      const autorAtualizadoResponse = await request(app)
        .put(`/api/autores/${autorId}`)
        .send(dadosAtualizacaoAutor)
        .expect(200);

      expect(autorAtualizadoResponse.body.biografia).toBe(dadosAtualizacaoAutor.biografia);
      expect(autorAtualizadoResponse.body.nome).toBe(novoAutor.nome); // Não alterado

      // 8. Tentar deletar autor com livros (deve falhar)
      const tentativaDeletarAutorResponse = await request(app)
        .delete(`/api/autores/${autorId}`)
        .expect(400);

      expect(tentativaDeletarAutorResponse.body.error).toContain('livros associados');

      // 9. Deletar livro primeiro
      const deletarLivroResponse = await request(app)
        .delete(`/api/livros/${livroId}`)
        .expect(200);

      expect(deletarLivroResponse.body.mensagem).toContain('deletado com sucesso');

      // 10. Verificar se livro foi deletado
      await request(app)
        .get(`/api/livros/${livroId}`)
        .expect(404);

      // 11. Agora deletar autor (deve funcionar)
      const deletarAutorResponse = await request(app)
        .delete(`/api/autores/${autorId}`)
        .expect(200);

      expect(deletarAutorResponse.body.mensagem).toContain('deletado com sucesso');

      // 12. Verificar se autor foi deletado
      await request(app)
        .get(`/api/autores/${autorId}`)
        .expect(404);

      // 13. Verificar listas vazias
      const autoresFinaisResponse = await request(app)
        .get('/api/autores')
        .expect(200);

      const livrosFinaisResponse = await request(app)
        .get('/api/livros')
        .expect(200);

      expect(autoresFinaisResponse.body).toHaveLength(0);
      expect(livrosFinaisResponse.body).toHaveLength(0);
    });
  });

  describe('Cenários de erro em integração', () => {
    it('deve manter consistência ao tentar criar livro com autor inexistente', async () => {
      const livroComAutorInexistente = {
        titulo: 'Livro Órfão',
        isbn: '978-3-16-148410-0',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: 99999 // ID que não existe
      };

      // Tentar criar livro com autor inexistente
      await request(app)
        .post('/api/livros')
        .send(livroComAutorInexistente)
        .expect(400);

      // Verificar que nenhum livro foi criado
      const livrosResponse = await request(app)
        .get('/api/livros')
        .expect(200);

      expect(livrosResponse.body).toHaveLength(0);
    });

    it('deve manter integridade referencial ao deletar autor com livros', async () => {
      // Criar autor
      const autor = await Autor.create({
        nome: 'Autor Teste',
        email: 'teste@exemplo.com',
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      });

      // Criar livro associado
      const livro = await Livro.create({
        titulo: 'Livro Teste',
        isbn: '978-3-16-148410-1',
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300,
        autorId: autor.id
      });

      // Tentar deletar autor (deve falhar)
      await request(app)
        .delete(`/api/autores/${autor.id}`)
        .expect(400);

      // Verificar que autor ainda existe
      const autorResponse = await request(app)
        .get(`/api/autores/${autor.id}`)
        .expect(200);

      expect(autorResponse.body.nome).toBe('Autor Teste');

      // Verificar que livro ainda existe
      const livroResponse = await request(app)
        .get(`/api/livros/${livro.id}`)
        .expect(200);

      expect(livroResponse.body.titulo).toBe('Livro Teste');
    });
  });

  describe('Validação de dados em cenários reais', () => {
    it('deve validar ISBN único entre múltiplos livros', async () => {
      const isbn = '978-3-16-148410-2';

      const livro1 = {
        titulo: 'Primeiro Livro',
        isbn: isbn,
        anoPublicacao: 2023,
        genero: 'Ficção',
        numeroPaginas: 300
      };

      const livro2 = {
        titulo: 'Segundo Livro',
        isbn: isbn, // Mesmo ISBN
        anoPublicacao: 2022,
        genero: 'Romance',
        numeroPaginas: 250
      };

      // Criar primeiro livro
      await request(app)
        .post('/api/livros')
        .send(livro1)
        .expect(201);

      // Tentar criar segundo livro com mesmo ISBN
      await request(app)
        .post('/api/livros')
        .send(livro2)
        .expect(400);

      // Verificar que apenas um livro foi criado
      const livrosResponse = await request(app)
        .get('/api/livros')
        .expect(200);

      expect(livrosResponse.body).toHaveLength(1);
      expect(livrosResponse.body[0].titulo).toBe('Primeiro Livro');
    });

    it('deve validar email único entre múltiplos autores', async () => {
      const email = 'mesmo@email.com';

      const autor1 = {
        nome: 'Primeiro Autor',
        email: email,
        dataNascimento: '1980-01-01',
        nacionalidade: 'Brasileira'
      };

      const autor2 = {
        nome: 'Segundo Autor',
        email: email, // Mesmo email
        dataNascimento: '1985-01-01',
        nacionalidade: 'Portuguesa'
      };

      // Criar primeiro autor
      await request(app)
        .post('/api/autores')
        .send(autor1)
        .expect(201);

      // Tentar criar segundo autor com mesmo email
      await request(app)
        .post('/api/autores')
        .send(autor2)
        .expect(400);

      // Verificar que apenas um autor foi criado
      const autoresResponse = await request(app)
        .get('/api/autores')
        .expect(200);

      expect(autoresResponse.body).toHaveLength(1);
      expect(autoresResponse.body[0].nome).toBe('Primeiro Autor');
    });
  });
});

