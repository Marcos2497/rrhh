const express = require('express');
const router = express.Router();
const espacioTrabajoController = require('../controllers/espacioTrabajoController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Rutas de validación
router.get('/validation/empleado/:empleadoId/can-change', isAuthenticated, espacioTrabajoController.canChangeEmpleadoWorkspace);
router.get('/validation/empresa/:empresaId/can-change', isAuthenticated, espacioTrabajoController.canChangeEmpresaWorkspace);
router.get('/validation/rol/:rolId/can-change', isAuthenticated, espacioTrabajoController.canChangeRolWorkspace);

// Todas las rutas requieren autenticación
router.get('/', isAuthenticated, espacioTrabajoController.getAll);
router.delete('/bulk', isAuthenticated, espacioTrabajoController.deleteBulk);
router.get('/:id', isAuthenticated, espacioTrabajoController.getById);
router.post('/', isAuthenticated, espacioTrabajoController.create);
router.put('/:id', isAuthenticated, espacioTrabajoController.update);
router.delete('/:id', isAuthenticated, espacioTrabajoController.deleteEspacio);
router.patch('/:id/reactivate', isAuthenticated, espacioTrabajoController.reactivate);

module.exports = router;
