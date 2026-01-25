const express = require('express');
const router = express.Router();
const registroSaludController = require('../controllers/registroSaludController');

router.get('/', registroSaludController.getAll);
router.get('/:id', registroSaludController.getById);
router.post('/', registroSaludController.create);
router.put('/:id', registroSaludController.update);
router.delete('/bulk', registroSaludController.bulkRemove);
router.delete('/:id', registroSaludController.remove);
router.patch('/:id/reactivate', registroSaludController.reactivate);

module.exports = router;
