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

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 */

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send test notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent
 */

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
