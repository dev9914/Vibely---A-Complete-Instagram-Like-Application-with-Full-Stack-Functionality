import { Notification } from '../../models/notification.model.js';
import { User } from '../../models/user.models.js';
import { sendPushToUser } from './fcm.service.js';
import crypto from 'crypto';
import { Post } from "../../models/post.model.js";
import mongoose from 'mongoose';

const assertMongoReady = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      `MongoDB is not connected in notification service (readyState=${mongoose.connection.readyState})`
    );
  }
};

const isTransientMongoError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('buffering timed out') ||
    message.includes('timed out') ||
    message.includes('ECONNRESET') ||
    message.includes('MongoNetworkError')
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validateNotificationPayload = (data) => {
  const requiredFields = ['recipient', 'sender', 'type', 'title', 'message'];
  for (const field of requiredFields) {
    if (!data?.[field]) {
      throw new Error(`Notification payload missing required field: ${field}`);
    }
  }
};

/**
 * Create a new notification (in-app)
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (data) => {
  validateNotificationPayload(data);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      assertMongoReady();

      const notification = await Notification.create(data);
      console.log(`✓ Notification created: ${notification._id}`);
      return notification;
    } catch (error) {
      const shouldRetry = attempt < 3 && isTransientMongoError(error);
      console.error(`❌ Error creating notification (attempt ${attempt}/3):`, error);

      if (!shouldRetry) {
        throw error;
      }

      await sleep(200 * attempt);
    }
  }
};

/**
 * Send notification to user (create in-app + send push)
 * @param {String} userId - User ID (recipient)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Result with notification and push status
 */
export const sendNotificationToUser = async (userId, notificationData) => {
  try {
    console.log(`📬 Sending notification to user ${userId}`);

    const normalizedNotificationData = {
      ...notificationData,
      metadata: notificationData?.metadata || notificationData?.data || {},
    };
    
    // Create in-app notification
    const notification = await createNotification({
      recipient: userId,
      ...normalizedNotificationData,
    });
    
    // Send push notification
    const pushPayload = {
      title: normalizedNotificationData.title,
      body: normalizedNotificationData.message,
      link: normalizedNotificationData.actionUrl || normalizedNotificationData.link || '/',
      data: {
        notificationId: notification._id.toString(),
        type: normalizedNotificationData.type,
        ...normalizedNotificationData.metadata,
      },
    };
    
    let pushResult = {
  success: false,
  reason: 'Push not attempted',
};

try {
  pushResult = await sendPushToUser(userId, pushPayload);
} catch (error) {
  console.error('Push notification failed:', error);
}
    
    return {
      success: true,
      notification,
      pushSent: pushResult.success,
      pushResult,
    };
  } catch (error) {
    console.error('❌ Error sending notification to user:', {
      userId,
      type: notificationData?.type,
      title: notificationData?.title,
      error: error?.stack || error,
    });
    throw error;
  }
};

/**
 * Register FCM device token
 * @param {String} userId - User ID
 * @param {String} token - FCM token
 * @param {String} userAgent - Browser user agent
 * @param {String} platform - Platform (web/android/ios/desktop)
 * @returns {Promise<Object>} - Registration result with deviceId
 */
export const registerDeviceToken = async (userId, token, userAgent = '', platform = 'web') => {
  try {
    console.log(`📱 Registering FCM token for user ${userId}`);
    
    const user = await User.findById(userId).select('fcmTokens');
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate device fingerprint
    const deviceFingerprint = crypto
      .createHash('sha256')
      .update(`${userId}-${userAgent}-${platform}`)
      .digest('hex')
      .substring(0, 16);
    
    // Check if token already exists
    const existingTokenIndex = user.fcmTokens.findIndex(
      t => t.token === token || t.deviceId === deviceFingerprint
    );
    
    if (existingTokenIndex !== -1) {
      // Update existing token
      user.fcmTokens[existingTokenIndex] = {
        token,
        platform,
        deviceId: deviceFingerprint,
        userAgent,
        lastUsed: new Date(),
        isActive: true,
        registeredAt: user.fcmTokens[existingTokenIndex].registeredAt,
      };
      console.log(`♻️  Updated existing FCM token for device ${deviceFingerprint}`);
    } else {
      // Add new token
      user.fcmTokens.push({
        token,
        platform,
        deviceId: deviceFingerprint,
        userAgent,
        lastUsed: new Date(),
        isActive: true,
        registeredAt: new Date(),
      });
      console.log(`➕ Added new FCM token for device ${deviceFingerprint}`);
    }
    
    await user.save();
    
    return {
      success: true,
      message: 'Token registered successfully',
      deviceId: deviceFingerprint,
      activeTokens: user.fcmTokens.filter(t => t.isActive).length,
    };
  } catch (error) {
    console.error('❌ Error registering device token:', error);
    throw error;
  }
};

/**
 * Unregister/deactivate FCM device token (on logout)
 * @param {String} userId - User ID
 * @param {String} deviceId - Device ID
 * @returns {Promise<Object>} - Deactivation result
 */
export const unregisterDeviceToken = async (userId, deviceId) => {
  try {
    console.log(`📱 Deactivating token for user ${userId}, device ${deviceId}`);
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find and deactivate the token
    const tokenIndex = user.fcmTokens.findIndex(t => t.deviceId === deviceId);
    
    if (tokenIndex !== -1) {
      user.fcmTokens[tokenIndex].isActive = false;
      await user.save();
      console.log(`✅ Token deactivated for device ${deviceId}`);
      
      return {
        success: true,
        message: 'Token deactivated successfully',
      };
    } else {
      return {
        success: false,
        message: 'Token not found',
      };
    }
  } catch (error) {
    console.error('❌ Error deactivating token:', error);
    throw error;
  }
};

/**
 * Get user's active devices
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Active devices info
 */
export const getActiveDevices = async (userId) => {
  try {
    const user = await User.findById(userId).select('fcmTokens');
    if (!user) {
      throw new Error('User not found');
    }
    
    const activeDevices = user.fcmTokens
      .filter(t => t.isActive)
      .map(t => ({
        deviceId: t.deviceId,
        platform: t.platform,
        userAgent: t.userAgent,
        lastUsed: t.lastUsed,
        registeredAt: t.registeredAt,
      }));
    
    return {
      success: true,
      devices: activeDevices,
      totalActive: activeDevices.length,
    };
  } catch (error) {
    console.error('❌ Error getting active devices:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('Notification not found or already read');
    }
    
    console.log(`✅ Notification ${notificationId} marked as read`);
    return notification;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Update result
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.markAllAsRead(userId);
    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    console.log(`✅ Notification ${notificationId} deleted`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get user's notifications with pagination
 * @param {String} userId - User ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Notifications with pagination
 */
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    page = Math.max(1, Number(page));
limit = Math.min(50, Math.max(1, Number(limit)));
    const skip = (page - 1) * limit;
    
const [notifications, total, unreadCount] = await Promise.all([
  Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "username fullName avatar")
    .lean(),

  Notification.countDocuments({ recipient: userId }),

  Notification.getUnreadCount(userId),
]);

// Attach post thumbnail for post notifications
const notificationsWithPreview = await Promise.all(
  notifications.map(async (notification) => {
    if (
      notification.relatedResource?.resourceType === "post" &&
      notification.relatedResource?.resourceId
    ) {
      const post = await Post.findById(
        notification.relatedResource.resourceId
      )
        .select("postImage")
        .lean();

      notification.postPreview = post?.postImage || null;
    }

    return notification;
  })
);
    
    return {
      success: true,
      notifications: notificationsWithPreview,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    throw error;
  }
};
