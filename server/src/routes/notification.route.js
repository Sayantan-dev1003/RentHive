const express = require('express');
const {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendTestNotification,
  getNotificationTemplates,
  createFromTemplate,
  getNotificationStats
} = require('../controllers/notification.controller');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// User notification routes
router.get('/', getNotifications);
router.get('/templates', getNotificationTemplates);
router.get('/stats', getNotificationStats);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.post('/', authorizeRoles('end_user'), createNotification);
router.post('/test', sendTestNotification);
router.post('/from-template', authorizeRoles('end_user'), createFromTemplate);

module.exports = router;
