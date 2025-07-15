const express = require('express');
const livroController = require('../controllers/livroController');

const router = express.Router();

// Rotas CRUD para livros
router.post('/', livroController.create);
router.get('/', livroController.getAll);
router.get('/:id', livroController.getById);
router.put('/:id', livroController.update);
router.delete('/:id', livroController.delete);

module.exports = router;

