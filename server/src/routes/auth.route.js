const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  getAllUsers,
  deleteUser
} = require('../controllers/auth.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/refresh', refreshToken);

// Admin only routes
router.get('/users', authorizeRoles('end_user'), getAllUsers);
router.delete('/users/:id', authorizeRoles('end_user'), deleteUser);

module.exports = router;
