const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/:userId', authMiddleware, messageController.getMessages);
router.put('/:userId/read', authMiddleware, messageController.markAsRead);

module.exports = router;