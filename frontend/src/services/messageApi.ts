import { api } from "./api";
import { MESSAGES_PER_PAGE } from "@/lib/constants";

export interface MessageUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface MessageAttachment {
  url: string;
  type: "image" | "video" | "pdf" | "zip" | "document" | "voice" | "file";
  name?: string;
  size?: number;
  duration?: number;
  mimeType?: string;
}

export interface Message {
  _id: string;
  conversationId?: string;
  senderId: string | MessageUser;
  receiverId: string | MessageUser;
  message: string;
  type?: "text" | "image" | "video" | "file" | "voice";
  attachments?: MessageAttachment[];
  replyTo?: Message | string | null;
  status?: "pending" | "sent" | "delivered" | "seen" | "failed";
  deliveredAt?: string | null;
  seenAt?: string | null;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  user: MessageUser;
  lastMessage: Message | null;
  unreadCount: number;
  muted?: boolean;
  updatedAt: string;
  lastSeen?: string | null;
}

export interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
  conversationId: string | null;
}

export interface SendMessageRequest {
  receiverId: string;
  message: string;
  type?: Message["type"];
  attachments?: MessageAttachment[];
  replyTo?: string;
  clientId?: string;
}

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ conversations: Conversation[] }, void>({
      query: () => "/message/conversations",
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

    getMessages: builder.query<MessagesPage, string>({
      query: (userId) =>
        `/message/get/${userId}?limit=${MESSAGES_PER_PAGE}`,
      serializeQueryArgs: ({ queryArgs }) => queryArgs,
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache) return newItems;
        // Initial load replaces; pagination handled via fetchMore in component
        return newItems;
      },
      providesTags: (_result, _error, userId) => [
        { type: "Message", id: userId },
      ],
    }),

    loadMoreMessages: builder.query<
      MessagesPage,
      { userId: string; before: string }
    >({
      query: ({ userId, before }) =>
        `/message/get/${userId}?limit=${MESSAGES_PER_PAGE}&before=${before}`,
    }),

    getConversationStatus: builder.query<
      { exists: boolean; conversationId: string | null },
      string
    >({
      query: (userId) => `/message/conversation/${userId}`,
    }),

    sendMessage: builder.mutation<
      { message: Message; conversationId: string },
      SendMessageRequest
    >({
      query: ({ receiverId, message, type, attachments, replyTo, clientId }) => ({
        url: `/message/send/${receiverId}`,
        method: "POST",
        body: { message, type, attachments, replyTo, clientId },
      }),
      async onQueryStarted(
        { receiverId, message, clientId, type, attachments, replyTo },
        { dispatch, queryFulfilled, getState },
      ) {
        const state: any = getState();
        const currentUser = state.auth.user;
        if (!currentUser) return;

        const tempId = clientId || `temp-${Date.now()}`;
        const optimisticMessage: Message = {
          _id: tempId,
          senderId: currentUser._id,
          receiverId,
          message,
          type: type || "text",
          attachments,
          replyTo: replyTo as any,
          status: "pending",
          clientId: tempId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existing = messageApi.endpoints.getMessages.select(receiverId)(state);
        const patchResult = existing?.data
          ? dispatch(
              messageApi.util.updateQueryData("getMessages", receiverId, (draft) => {
                draft.messages.push(optimisticMessage);
              }),
            )
          : dispatch(
              messageApi.util.upsertQueryData("getMessages", receiverId, {
                messages: [optimisticMessage],
                hasMore: false,
                conversationId: null,
              }),
            );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            messageApi.util.updateQueryData("getMessages", receiverId, (draft) => {
              const index = draft.messages.findIndex(
                (m) => m._id === tempId || m.clientId === tempId,
              );
              if (index !== -1) {
                draft.messages[index] = { ...data.message, status: "sent" };
              }
              draft.conversationId = data.conversationId;
            }),
          );
          dispatch(
            messageApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }]),
          );
        } catch {
          patchResult.undo();
          dispatch(
            messageApi.util.updateQueryData("getMessages", receiverId, (draft) => {
              const index = draft.messages.findIndex(
                (m) => m._id === tempId || m.clientId === tempId,
              );
              if (index !== -1) draft.messages[index].status = "failed";
            }),
          );
        }
      },
    }),

    markMessagesAsRead: builder.mutation<{ success: boolean }, string>({
      query: (conversationId) => ({
        url: `/message/${conversationId}/read`,
        method: "PATCH",
      }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          messageApi.util.updateQueryData("getConversations", undefined, (draft) => {
            const conversation = draft?.conversations?.find((c) => c._id === conversationId);
            if (conversation) conversation.unreadCount = 0;
          }),
        );
        try {
          await queryFulfilled;
          dispatch(messageApi.util.invalidateTags([{ type: "Message", id: "UNREAD_COUNT" }]));
        } catch {
          patchResult.undo();
        }
      },
    }),

    deleteMessage: builder.mutation<
      { success: boolean },
      { messageId: string; scope?: "me" | "everyone" }
    >({
      query: ({ messageId, scope = "me" }) => ({
        url: `/message/${messageId}?scope=${scope}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/message/unread-count",
      providesTags: [{ type: "Message", id: "UNREAD_COUNT" }],
    }),

    muteConversation: builder.mutation<
      { success: boolean; muted: boolean },
      { conversationId: string; muted: boolean }
    >({
      query: ({ conversationId, muted }) => ({
        url: `/message/${conversationId}/settings`,
        method: "PATCH",
        body: { muted },
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLoadMoreMessagesQuery,
  useLazyLoadMoreMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useDeleteMessageMutation,
  useGetUnreadCountQuery,
  useGetConversationStatusQuery,
  useMuteConversationMutation,
} = messageApi;

export default messageApi;
