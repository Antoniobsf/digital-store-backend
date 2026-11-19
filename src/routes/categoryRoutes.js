const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);
router.post('/', authMiddleware, categoryController.create);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.remove);

module.exports = router;
