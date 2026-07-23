import { api } from "./api";

/**
 * Message API Service
 *
 * Handles all messaging-related endpoints including:
 * - Send/receive messages
 * - Conversations management
 * - Message history
 *
 * Note: Real-time message delivery is handled via Socket.IO
 * This API is for HTTP-based message operations and fetching history
 */

// ========== TYPES ==========

export interface MessageUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface Message {
  _id: string;
  senderId: string | MessageUser;
  receiverId: string | MessageUser;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  user: MessageUser;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationStatusResponse {
  success: boolean;
  exists: boolean;
  conversationId: string | null;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

export interface SendMessageRequest {
  receiverId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
  conversationId: string;
}

// ========== API ENDPOINTS ==========

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all conversations for current user
     */
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => "/message/conversations",
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      providesTags: (result) =>
        result?.conversations
          ? [
              ...result.conversations.map(({ _id }) => ({
                type: "Conversation" as const,
                id: _id,
              })),
              { type: "Conversation", id: "LIST" },
            ]
          : [{ type: "Conversation", id: "LIST" }],
    }),

    /**
     * Get messages between current user and another user
     */
    getMessages: builder.query<MessagesResponse, string>({
      query: (userId) => `/message/get/${userId}`,
      providesTags: (_result, _error, userId) => [
        { type: "Message", id: userId },
      ],
    }),

    getConversationStatus: builder.query<
    ConversationStatusResponse,
    string
>({
    query: (userId) =>
        `/message/conversation/${userId}`,
}),

    /**
     * Send a message
     * Socket.IO will handle real-time delivery, but we update cache here
     */
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: ({ receiverId, message }) => ({
        url: `/message/send/${receiverId}`,
        method: "POST",
        body: { message },
      }),
      // Optimistic update - add message to cache immediately
      async onQueryStarted(
        { receiverId, message },
        { dispatch, queryFulfilled, getState },
      ) {
        const state: any = getState();
        const currentUser = state.auth.user;

        if (!currentUser) return;

        // Create optimistic message
        const optimisticMessage: Message = {
          _id: `temp-${Date.now()}`,
          senderId: currentUser._id,
          receiverId,
          message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update messages cache
        const patchResult = dispatch(
          messageApi.util.updateQueryData(
            "getMessages",
            receiverId,
            (draft) => {
              draft.messages.push(optimisticMessage);
            },
          ),
        );

        try {
          const { data } = await queryFulfilled;

          // Replace temp message with real message
          dispatch(
            messageApi.util.updateQueryData(
              "getMessages",
              receiverId,
              (draft) => {
                const index = draft.messages.findIndex(
                  (m) => m._id === optimisticMessage._id,
                );
                if (index !== -1) {
                  draft.messages[index] = data.message;
                }
              },
            ),
          );

          // Update conversations cache so newly created conversations appear immediately in the list.
          dispatch(
            messageApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                if (!draft || !draft.conversations) {
                  return;
                }

                const otherUser =
                  typeof data.message.receiverId === "object"
                    ? data.message.receiverId
                    : {
                        _id: receiverId,
                        username: "",
                        fullName: "",
                        avatar: "",
                      };

                const existingConversation = draft.conversations.find(
                  (conversation) =>
                    conversation.user._id === receiverId,
                );

                const newConversation = {
                  _id: data.conversationId || `temp-${Date.now()}`,
                  user: otherUser,
                  lastMessage: data.message,
                  unreadCount: 0,
                  updatedAt: data.message.createdAt,
                };

                if (existingConversation) {
                  existingConversation.lastMessage = data.message;
                  existingConversation.updatedAt = data.message.createdAt;
                  existingConversation.unreadCount = 0;
                } else {
                  draft.conversations = [newConversation, ...(draft.conversations || [])];
                }
              },
            ),
          );

          dispatch(
            messageApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
            ]),
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { receiverId }) => [
        { type: "Message", id: receiverId },
        { type: "Conversation", id: "LIST" },
      ],
    }),

    /**
     * Mark messages as read
     */
    markMessagesAsRead: builder.mutation<{ success: boolean }, string>({
      query: (conversationId) => ({
        url: `/message/${conversationId}/read`,
        method: "PATCH",
      }),
      // Optimistic update
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          messageApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conversation = draft.conversations.find(
                (c) => c._id === conversationId,
              );
              if (conversation) {
                conversation.unreadCount = 0;
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    /**
     * Delete a message
     */
    deleteMessage: builder.mutation<{ success: boolean }, string>({
      query: (messageId) => ({
        url: `/message/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Message" },
        { type: "Conversation", id: "LIST" },
      ],
    }),

    /**
     * Get unread message count
     */
    getUnreadCount: builder.query<{ success: boolean; count: number }, void>({
      query: () => "/message/unread-count",
      providesTags: [{ type: "Message", id: "UNREAD_COUNT" }],
    }),
  }),
});

// ========== EXPORT HOOKS ==========

/**
 * Auto-generated hooks for use in components
 *
 * Usage:
 * const { data, isLoading } = useGetConversationsQuery();
 * const [sendMessage] = useSendMessageMutation();
 */
export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useDeleteMessageMutation,
  useGetUnreadCountQuery,
  useGetConversationStatusQuery
} = messageApi;

export default messageApi;
