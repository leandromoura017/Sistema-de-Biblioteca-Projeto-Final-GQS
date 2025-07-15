const { Autor, Livro } = require('../models');

const autorController = {
  // POST /autores - Criar um novo autor
  async create(req, res) {
    try {
      const { nome, email, dataNascimento, nacionalidade, biografia } = req.body;

      // Validar se todos os campos obrigatórios estão presentes
      if (!nome || !email || !dataNascimento || !nacionalidade) {
        return res.status(400).json({
          error: 'Todos os campos obrigatórios devem ser preenchidos',
          campos: ['nome', 'email', 'dataNascimento', 'nacionalidade']
        });
      }

      const novoAutor = await Autor.create({
        nome,
        email,
        dataNascimento,
        nacionalidade,
        biografia: biografia || null
      });

      res.status(201).json(novoAutor);
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
          error: 'Email já existe no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // GET /autores - Listar todos os autores
  async getAll(req, res) {
    try {
      const autores = await Autor.findAll({
        include: [{
          model: Livro,
          as: 'livros',
          attributes: ['id', 'titulo', 'isbn', 'anoPublicacao']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(autores);
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // GET /autores/:id - Buscar autor por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const autor = await Autor.findByPk(id, {
        include: [{
          model: Livro,
          as: 'livros',
          attributes: ['id', 'titulo', 'isbn', 'anoPublicacao', 'genero']
        }]
      });

      if (!autor) {
        return res.status(404).json({
          error: 'Autor não encontrado'
        });
      }

      res.status(200).json(autor);
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // PUT /autores/:id - Atualizar autor por ID
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, dataNascimento, nacionalidade, biografia } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const autor = await Autor.findByPk(id);

      if (!autor) {
        return res.status(404).json({
          error: 'Autor não encontrado'
        });
      }

      await autor.update({
        nome: nome || autor.nome,
        email: email || autor.email,
        dataNascimento: dataNascimento || autor.dataNascimento,
        nacionalidade: nacionalidade || autor.nacionalidade,
        biografia: biografia !== undefined ? biografia : autor.biografia
      });

      const autorAtualizado = await Autor.findByPk(id, {
        include: [{
          model: Livro,
          as: 'livros',
          attributes: ['id', 'titulo', 'isbn']
        }]
      });

      res.status(200).json(autorAtualizado);
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
          error: 'Email já existe no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  },

  // DELETE /autores/:id - Deletar autor por ID
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const autor = await Autor.findByPk(id);

      if (!autor) {
        return res.status(404).json({
          error: 'Autor não encontrado'
        });
      }

      // Verificar se o autor tem livros associados
      const livrosAssociados = await Livro.findAll({
        where: { autorId: id }
      });

      if (livrosAssociados.length > 0) {
        return res.status(400).json({
          error: 'Não é possível deletar o autor pois existem livros associados a ele',
          livrosAssociados: livrosAssociados.length
        });
      }

      await autor.destroy();

      res.status(200).json({
        mensagem: 'Autor deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno do servidor',
        mensagem: error.message
      });
    }
  }
};

module.exports = autorController;

