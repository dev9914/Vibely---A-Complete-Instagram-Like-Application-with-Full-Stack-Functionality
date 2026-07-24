import mongoose from "mongoose";

const participantSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    unreadCount: { type: Number, default: 0 },
    muted: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    lastReadAt: { type: Date, default: null },
  },
  { _id: false },
);

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    text: { type: String, default: "" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, default: "text" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participantKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    participantSettings: [participantSettingSchema],
    lastMessage: lastMessageSchema,
    // Legacy field — kept for backward compatibility during migration
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ "participantSettings.userId": 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
