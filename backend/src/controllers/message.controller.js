import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId,io } from "../utils/socket.js";

export const sendMessage = async (req, res) => {
   try {
       const { message } = req.body;
       const { receiverId } = req.params;
       const senderId = req.user._id;

       if (!message) {
           return res.status(400).json({ error: "Message content cannot be empty" });
       }

       let conversation = await Conversation.findOne({
           participants: { $all: [senderId, receiverId] }
       });

       if (!conversation) {
           conversation = await Conversation.create({
               participants: [senderId, receiverId]
           });
       }

       const newMessage = new Message({
           senderId,
           receiverId,
           message,
       });

       if (newMessage) {
           conversation.messages.push(newMessage._id);
       }

       await Promise.all([conversation.save(), newMessage.save()]);

    //    console.log(receiverId)

       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId) {
           io.to(receiverSocketId).emit("newMessage", newMessage);
       }

       return res.status(201).json(newMessage);

   } catch (error) {
       console.log("Error in sendMessage controller:", error.message);
       res.status(500).json({ error: "Internal server error" });
   }
};

export const getMessage = async (req, res) => {
   try {
       const { userToChatId } = req.params;
       const senderId = req.user._id;

       const conversation = await Conversation.findOne({
           participants: { $all: [senderId, userToChatId] }
       }).populate("messages");

       if (!conversation) {
           return res.status(200).json([]);
       }

       const messages = conversation.messages;
       res.status(200).json(messages);

   } catch (error) {
       console.log("Error in getMessage controller:", error.message);
       res.status(500).json({ error: "Internal server error" });
   }
};