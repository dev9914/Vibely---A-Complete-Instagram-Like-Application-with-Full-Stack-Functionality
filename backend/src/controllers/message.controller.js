import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        error: "Receiver id is required",
      });
    }

    if (receiverId === senderId.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot send messages to yourself",
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message content cannot be empty",
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create message
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
    });

    // Add message to conversation
    conversation.messages.push(newMessage._id);

    // Keep newest conversations at the top
    conversation.updatedAt = new Date();

    // Save both together
    await Promise.all([
      newMessage.save(),
      conversation.save(),
    ]);

    // Populate sender & receiver for frontend
    await newMessage.populate([
      {
        path: "senderId",
        select: "username fullName avatar",
      },
      {
        path: "receiverId",
        select: "username fullName avatar",
      },
    ]);

    // Send realtime message if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      message: newMessage,
      conversationId: conversation._id,
    });

  } catch (error) {
    console.error("Error in sendMessage controller:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { userToChatId } = req.params;
    const currentUser = req.user._id;

    if (!userToChatId) {
      return res.status(400).json({
        success: false,
        error: "User id is required",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUser, userToChatId] },
    }).populate({
      path: "messages",
      options: {
        sort: {
          createdAt: 1,
        },
      },
      populate: [
        {
          path: "senderId",
          select: "username fullName avatar",
        },
        {
          path: "receiverId",
          select: "username fullName avatar",
        },
      ],
    });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });

  } catch (error) {
    console.error("Error in getMessage controller:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUser,
    })
      .populate(
        "participants",
        "username fullName avatar"
      )
      .populate({
        path: "messages",
        options: {
          sort: {
            createdAt: -1,
          },
          limit: 1,
        },
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      })
      .sort({
        updatedAt: -1,
      });

    const formattedConversations = conversations.map(
      (conversation) => {

        const otherUser = conversation.participants.find(
          (participant) =>
            participant._id.toString() !== currentUser.toString()
        );

        return {
          _id: conversation._id,

          user: otherUser,

          lastMessage:
            conversation.messages.length > 0
              ? conversation.messages[0]
              : null,

          unreadCount: 0,

          updatedAt: conversation.updatedAt,
        };
      }
    );

    return res.status(200).json({
      success: true,
      conversations: formattedConversations,
    });

  } catch (error) {
    console.error("Error in getConversations:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getConversationByUser = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const { userId } = req.params;

    const conversation = await Conversation.findOne({
      participants: {
        $all: [currentUser, userId],
      },
    });

    return res.status(200).json({
      success: true,
      exists: !!conversation,
      conversationId: conversation?._id || null,
    });

  } catch (error) {
    console.error("Error in getConversationByUser:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
