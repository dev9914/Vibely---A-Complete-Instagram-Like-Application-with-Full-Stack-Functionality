import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  registerToken,
  deactivateToken,
  getUserDevices,
} from '../controllers/notifications/device.controller.js';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
  sendTestNotification,
} from '../controllers/notifications/notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(verifyJWT);

// ========== DEVICE TOKEN MANAGEMENT ==========
router.post('/register-token', registerToken);
router.post('/deactivate', deactivateToken);
router.get('/my-devices', getUserDevices);

// ========== NOTIFICATION MANAGEMENT ==========
router.get('/my-notifications', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotificationById);

// ========== TESTING ==========
router.post('/test', sendTestNotification);

export default router;
