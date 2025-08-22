const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/profile', protect, deleteUser);

module.exports = router;