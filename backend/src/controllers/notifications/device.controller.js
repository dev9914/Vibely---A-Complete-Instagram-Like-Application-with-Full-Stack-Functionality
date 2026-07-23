import {
  registerDeviceToken,
  unregisterDeviceToken,
  getActiveDevices,
} from '../../services/notifications/notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Register FCM device token
 * POST /api/v1/notifications/register-token
 */
export const registerToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body;

  if (!platform) {
  return res.status(400).json(
    new ApiResponse(400, {}, 'Platform is required')
  );
}
  const userId = req.user._id;
  const userAgent = req.headers['user-agent'] || '';

  if (!token) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'FCM token is required')
    );
  }


  const result = await registerDeviceToken(userId, token, userAgent, platform);

  res.status(200).json(
    new ApiResponse(200, result, 'Token registered successfully')
  );
});

/**
 * Deactivate FCM device token (on logout)
 * POST /api/v1/notifications/deactivate
 */
export const deactivateToken = asyncHandler(async (req, res) => {
  const { deviceId } = req.body;
  const userId = req.user._id;

  if (!deviceId) {
    return res.status(400).json(
      new ApiResponse(400, {}, 'Device ID is required')
    );
  }

  const result = await unregisterDeviceToken(userId, deviceId);

  res.status(200).json(
    new ApiResponse(200, result, result.message)
  );
});

/**
 * Get user's active devices
 * GET /api/v1/notifications/my-devices
 */
export const getUserDevices = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await getActiveDevices(userId);

  res.status(200).json(
    new ApiResponse(200, result, 'Active devices fetched successfully')
  );
});
