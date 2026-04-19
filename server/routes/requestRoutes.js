const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const requestController = require('../controllers/requestController');

router.post('/', authMiddleware, requestController.createRequest);
router.get('/', authMiddleware, requestController.getRequests);
router.put('/:id', authMiddleware, requestController.updateRequest);

module.exports = router;
