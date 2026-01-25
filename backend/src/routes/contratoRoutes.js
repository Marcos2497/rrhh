const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');

router.get('/', contratoController.getAll);
router.get('/empleado/:empleadoId/puestos-con-contrato', contratoController.getPuestosConContrato);
router.get('/:id', contratoController.getById);
router.post('/', contratoController.create);
router.put('/:id', contratoController.update);
router.delete('/bulk', contratoController.bulkRemove);
router.delete('/:id', contratoController.remove);
router.patch('/:id/reactivate', contratoController.reactivate);

module.exports = router;
