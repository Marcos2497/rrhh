const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/', empleadoController.getAll);
router.get('/:id', empleadoController.getById);
router.post('/', empleadoController.create);
router.put('/:id', empleadoController.update);
router.delete('/bulk', empleadoController.bulkRemove);
router.delete('/:id', empleadoController.remove);
router.patch('/:id/reactivate', empleadoController.reactivate);

module.exports = router;
