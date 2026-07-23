import { api } from './api';

/**
 * Notification API Service
 * 
 * Handles all notification-related endpoints including:
 * - Fetching notifications
 * - FCM token registration/deactivation
 * - Mark as read functionality
 * - Real-time notification updates
 */

// ========== TYPES ==========

export interface NotificationSender {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: NotificationSender;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'reply' | 'comment_like' | 'story' | 'tag';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  actionUrl: string;
  relatedResource?: {
    resourceType: 'post' | 'comment' | 'user' | 'message';
    resourceId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export interface RegisterTokenRequest {
  token: string;
  platform?: 'web' | 'android' | 'ios' | 'desktop';
  userAgent?: string;
}

export interface RegisterTokenResponse {
  success: boolean;
  message: string;
  deviceId: string;
}

// ========== API ENDPOINTS ==========

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get all notifications for the current user
     * Auto-refetches on focus/reconnect
     */
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => '/notifications/my-notifications',
      providesTags: ['Notification'],
      // Poll for new notifications every 30 seconds (optional)
      // pollingInterval: 30000,
    }),
    
    /**
     * Register FCM token for push notifications
     */
    registerFCMToken: builder.mutation<RegisterTokenResponse, RegisterTokenRequest>({
      query: (body) => ({
        url: '/notifications/register-token',
        method: 'POST',
        body,
      }),
    }),
    
    /**
     * Deactivate FCM token (on logout)
     */
    deactivateFCMToken: builder.mutation<{ success: boolean }, { deviceId: string }>({
      query: (body) => ({
        url: '/notifications/deactivate',
        method: 'POST',
        body,
      }),
    }),
    
    /**
     * Mark a single notification as read
     * Uses optimistic update for instant UI feedback
     */
    markNotificationAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      // Optimistic update - update UI immediately before server responds
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getNotifications',
            undefined,
            (draft) => {
              const notification = draft.notifications.find((n) => n._id === id);
              if (notification && !notification.isRead) {
                notification.isRead = true;
                notification.readAt = new Date().toISOString();
                draft.unreadCount = Math.max(0, draft.unreadCount - 1);
              }
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Rollback optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    
    /**
     * Mark all notifications as read
     */
    markAllNotificationsAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      // Optimistic update
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getNotifications',
            undefined,
            (draft) => {
              draft.notifications.forEach((notification) => {
                if (!notification.isRead) {
                  notification.isRead = true;
                  notification.readAt = new Date().toISOString();
                }
              });
              draft.unreadCount = 0;
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    
    /**
     * Delete a notification
     */
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            'getNotifications',
            undefined,
            (draft) => {
              const index = draft.notifications.findIndex((n) => n._id === id);
              if (index !== -1) {
                const notification = draft.notifications[index];
                if (!notification.isRead) {
                  draft.unreadCount = Math.max(0, draft.unreadCount - 1);
                }
                draft.notifications.splice(index, 1);
              }
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    
    /**
     * Send test notification (for debugging)
     */
    sendTestNotification: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/notifications/test',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// ========== EXPORT HOOKS ==========

/**
 * Auto-generated hooks for use in components
 * 
 * Usage:
 * const { data, isLoading, error } = useGetNotificationsQuery();
 * const [markAsRead] = useMarkNotificationAsReadMutation();
 */
export const {
  useGetNotificationsQuery,
  useRegisterFCMTokenMutation,
  useDeactivateFCMTokenMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useSendTestNotificationMutation,
} = notificationApi;

export default notificationApi;
