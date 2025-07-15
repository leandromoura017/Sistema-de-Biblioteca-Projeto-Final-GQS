const express = require('express');
const autorController = require('../controllers/autorController');

const router = express.Router();

// Rotas CRUD para autores
router.post('/', autorController.create);
router.get('/', autorController.getAll);
router.get('/:id', autorController.getById);
router.put('/:id', autorController.update);
router.delete('/:id', autorController.delete);

module.exports = router;

