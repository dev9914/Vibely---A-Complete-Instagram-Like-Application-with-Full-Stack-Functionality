import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendNotificationToUser,
} from '../../services/notifications/notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Get user's notifications with pagination
 * GET /api/v1/notifications/my-notifications
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await getUserNotifications(userId, page, limit);

  res.status(200).json(
    new ApiResponse(200, result, 'Notifications fetched successfully')
  );
});

/**
 * Mark a notification as read
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await markNotificationAsRead(id, userId);

  res.status(200).json(
    new ApiResponse(200, { notification }, 'Notification marked as read')
  );
});

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await markAllNotificationsAsRead(userId);

  res.status(200).json(
    new ApiResponse(200, result, 'All notifications marked as read')
  );
});

/**
 * Delete a notification
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await deleteNotification(id, userId);

  res.status(200).json(
    new ApiResponse(200, {}, 'Notification deleted successfully')
  );
});

/**
 * Send test notification (for debugging)
 * POST /api/v1/notifications/test
 */
export const sendTestNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (process.env.NODE_ENV === 'production') {
  return res.status(403).json(
    new ApiResponse(
      403,
      {},
      'Test notifications disabled in production'
    )
  );
}

  console.log(`🧪 Sending test notification to user ${userId}`);

  const notification = {
    sender: userId,
    type: 'message',
    title: 'Test Notification',
    message: 'This is a test notification from Vibely!',
    actionUrl: '/',
    data: {
      type: 'test',
      timestamp: new Date().toISOString(),
    },
  };

  const result = await sendNotificationToUser(userId, notification);

  res.status(200).json(
    new ApiResponse(200, result, 'Test notification sent successfully')
  );
});
