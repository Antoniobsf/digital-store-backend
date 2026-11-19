const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', userController.create);
router.post('/token', userController.login);
router.get('/:id', userController.getById);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.remove);

module.exports = router;
