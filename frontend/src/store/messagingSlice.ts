import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresenceEntry {
  status: "online" | "offline";
  lastSeen: string | null;
}

interface MessagingState {
  onlineUsers: string[];
  presence: Record<string, PresenceEntry>;
  typingByConversation: Record<string, string | null>;
  activeConversationId: string | null;
  activeChatUserId: string | null;
}

const initialState: MessagingState = {
  onlineUsers: [],
  presence: {},
  typingByConversation: {},
  activeConversationId: null,
  activeChatUserId: null,
};

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    setPresenceUpdate: (
      state,
      action: PayloadAction<{ userId: string; status: "online" | "offline"; lastSeen?: string }>,
    ) => {
      const { userId, status, lastSeen } = action.payload;
      state.presence[userId] = {
        status,
        lastSeen: lastSeen || state.presence[userId]?.lastSeen || null,
      };
      if (status === "online" && !state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
      if (status === "offline") {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string | null }>,
    ) => {
      state.typingByConversation[action.payload.conversationId] =
        action.payload.userId;
    },
    setActiveChat: (
      state,
      action: PayloadAction<{ conversationId: string | null; userId: string | null }>,
    ) => {
      state.activeConversationId = action.payload.conversationId;
      state.activeChatUserId = action.payload.userId;
    },
    resetMessaging: () => initialState,
  },
});

export const {
  setOnlineUsers,
  setPresenceUpdate,
  setTyping,
  setActiveChat,
  resetMessaging,
} = messagingSlice.actions;

export const selectOnlineUsers = (state: { messaging: MessagingState }) =>
  state.messaging.onlineUsers;
export const selectPresence = (state: { messaging: MessagingState }) =>
  state.messaging.presence;
export const selectTypingByConversation = (state: { messaging: MessagingState }) =>
  state.messaging.typingByConversation;
export const selectActiveChatUserId = (state: { messaging: MessagingState }) =>
  state.messaging.activeChatUserId;
export const selectActiveConversationId = (state: { messaging: MessagingState }) =>
  state.messaging.activeConversationId;

export default messagingSlice.reducer;
