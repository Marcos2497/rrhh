const express = require('express');
const router = express.Router();
const nacionalidadController = require('../controllers/nacionalidadController');

router.get('/', nacionalidadController.getAll);
router.get('/:id', nacionalidadController.getById);
router.post('/', nacionalidadController.create);
router.put('/:id', nacionalidadController.update);
router.delete('/:id', nacionalidadController.remove);

module.exports = router;
