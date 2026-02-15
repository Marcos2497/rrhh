const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');


// Todas las rutas requieren autenticación
router.use(isAuthenticated);

// Rutas de lectura (accesibles para usuarios autenticados)
router.get('/', rolController.getAll);
router.get('/:id', rolController.getById);

// Rutas de escritura (requieren permisos de administrador)
router.delete('/bulk', isAdmin, rolController.deleteBulk);
router.post('/', isAdmin, rolController.create);
router.put('/:id', isAdmin, rolController.update);
router.delete('/:id', isAdmin, rolController.deleteRol);
router.patch('/:id/reactivate', isAdmin, rolController.reactivate);


module.exports = router;
