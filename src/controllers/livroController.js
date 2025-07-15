const { Livro, Autor } = require('../models');

const livroController = {
  // POST /livros - Criar um novo livro
  async create(req, res) {
    try {
      const { titulo, isbn, anoPublicacao, genero, numeroPaginas, autorId } = req.body;

      // Validar se todos os campos obrigatórios estão presentes
      if (!titulo || !isbn || !anoPublicacao || !genero || !numeroPaginas) {
        return res.status(400).json({
          error: 'Todos os campos obrigatórios devem ser preenchidos',
          campos: ['titulo', 'isbn', 'anoPublicacao', 'genero', 'numeroPaginas']
        });
      }

      // Verificar se o autor existe (se autorId foi fornecido)
      if (autorId) {
        const autorExiste = await Autor.findByPk(autorId);
        if (!autorExiste) {
          return res.status(400).json({
            error: 'Autor não encontrado'
          });
        }
      }

      const novoLivro = await Livro.create({
        titulo,
        isbn,
        anoPublicacao,
        genero,
        numeroPaginas,
        autorId: autorId || null
      });

      res.status(201).json(novoLivro);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Dados inválidos',
          detalhes: error.errors.map(err => ({
            campo: err.path,
            mensagem: err.message
          }))
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'ISBN já existe no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // GET /livros - Listar todos os livros
  async getAll(req, res) {
    try {
      const livros = await Livro.findAll({
        include: [{
          model: Autor,
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(livros);
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // GET /livros/:id - Buscar livro por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const livro = await Livro.findByPk(id, {
        include: [{
          model: Autor,
          as: 'autor',
          attributes: ['id', 'nome', 'email', 'nacionalidade']
        }]
      });

      if (!livro) {
        return res.status(404).json({
          error: 'Livro não encontrado'
        });
      }

      res.status(200).json(livro);
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // PUT /livros/:id - Atualizar livro por ID
  async update(req, res) {
    try {
      const { id } = req.params;
      const { titulo, isbn, anoPublicacao, genero, numeroPaginas, autorId } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const livro = await Livro.findByPk(id);

      if (!livro) {
        return res.status(404).json({
          error: 'Livro não encontrado'
        });
      }

      // Verificar se o autor existe (se autorId foi fornecido)
      if (autorId) {
        const autorExiste = await Autor.findByPk(autorId);
        if (!autorExiste) {
          return res.status(400).json({
            error: 'Autor não encontrado'
          });
        }
      }

      await livro.update({
        titulo: titulo || livro.titulo,
        isbn: isbn || livro.isbn,
        anoPublicacao: anoPublicacao || livro.anoPublicacao,
        genero: genero || livro.genero,
        numeroPaginas: numeroPaginas || livro.numeroPaginas,
        autorId: autorId !== undefined ? autorId : livro.autorId
      });

      const livroAtualizado = await Livro.findByPk(id, {
        include: [{
          model: Autor,
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        }]
      });

      res.status(200).json(livroAtualizado);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Dados inválidos',
          detalhes: error.errors.map(err => ({
            campo: err.path,
            mensagem: err.message
          }))
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'ISBN já existe no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // DELETE /livros/:id - Deletar livro por ID
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const livro = await Livro.findByPk(id);

      if (!livro) {
        return res.status(404).json({
          error: 'Livro não encontrado'
        });
      }

      await livro.destroy();

      res.status(200).json({
        mensagem: 'Livro deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  }
};

module.exports = livroController;

