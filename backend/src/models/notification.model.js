import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'message', 'mention', 'reply', 'comment_like', 'story', 'tag'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Index for unread queries
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      trim: true,
      default: "",
    },
    relatedResource: {
      resourceType: {
        type: String,
        enum: ['post', 'comment', 'user', 'message'],
      },
      resourceId: {
        type: String,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries (recipient + isRead + createdAt)
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Virtual for populating sender details
NotificationSchema.virtual('senderDetails', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtuals are included when converting to JSON
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all as read
NotificationSchema.statics.markAllAsRead = async function(userId) {
  const now = new Date();
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );
};

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
