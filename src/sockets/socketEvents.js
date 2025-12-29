import db from "../models/index.js";

const { Message, User, Chat } = db;

export const handleJoinChat = async (io, socket, data) => {
  try {
    const { chatId } = data;

    // Verify user is member of chat
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: User, as: "users", where: { id: socket.userId } }],
    });

    if (!chat) {
      return socket.emit("error", { message: "Chat not found or forbidden" });
    }

    socket.join(`chat_${chatId}`);
    socket.emit("joined_chat", { chatId });

    console.log(`User ${socket.userId} joined chat ${chatId}`);
  } catch (error) {
    console.error("Join chat error:", error);
    socket.emit("error", { message: "Failed to join chat" });
  }
};

export const handleLeaveChat = (io, socket, data) => {
  try {
    const { chatId } = data;
    socket.leave(`chat_${chatId}`);
    socket.emit("left_chat", { chatId });

    console.log(`User ${socket.userId} left chat ${chatId}`);
  } catch (error) {
    console.error("Leave chat error:", error);
    socket.emit("error", { message: "Failed to leave chat" });
  }
};

export const handleSendMessage = async (io, socket, data) => {
  try {
    const { chatId, content, type = "text" } = data;

    // Verify user is member of chat
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: User, as: "users", where: { id: socket.userId } }],
    });

    if (!chat) {
      return socket.emit("error", { message: "Chat not found or forbidden" });
    }

    // Create message
    const message = await Message.create({
      chatId,
      userId: socket.userId,
      content,
      type,
    });

    // Fetch complete message with sender
    const completeMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    // Emit to all users in chat
    io.to(`chat_${chatId}`).emit("new_message", completeMessage);

    // Send acknowledgment to sender
    socket.emit("message_delivered", {
      tempId: data.tempId,
      messageId: message.id,
      timestamp: message.createdAt,
    });

    console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
  } catch (error) {
    console.error("Send message error:", error);
    socket.emit("error", { message: "Failed to send message" });
  }
};

export const handleTypingStart = async (io, socket, data) => {
  try {
    const { chatId } = data;

    // Verify user is member of chat
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: User, as: "users", where: { id: socket.userId } }],
    });

    if (!chat) {
      return socket.emit("error", { message: "Chat not found or forbidden" });
    }

    const user = await User.findByPk(socket.userId, {
      attributes: ["id", "username", "avatar"],
    });

    // Emit to all users in chat except sender
    socket.to(`chat_${chatId}`).emit("user_typing", {
      chatId,
      user,
    });
  } catch (error) {
    console.error("Typing start error:", error);
  }
};

export const handleTypingStop = async (io, socket, data) => {
  try {
    const { chatId } = data;

    // Emit to all users in chat except sender
    socket.to(`chat_${chatId}`).emit("user_stopped_typing", {
      chatId,
      userId: socket.userId,
    });
  } catch (error) {
    console.error("Typing stop error:", error);
  }
};

export const handleMessageRead = async (io, socket, data) => {
  try {
    const { messageId, chatId } = data;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return socket.emit("error", { message: "Message not found" });
    }

    // Add user to readBy array
    const readBy = message.readBy || [];
    if (!readBy.includes(socket.userId)) {
      readBy.push(socket.userId);
      await message.update({ readBy, isRead: true });
    }

    // Emit to all users in chat
    io.to(`chat_${chatId}`).emit("message_read_update", {
      messageId,
      chatId,
      userId: socket.userId,
      readBy,
    });
  } catch (error) {
    console.error("Message read error:", error);
    socket.emit("error", { message: "Failed to mark message as read" });
  }
};
