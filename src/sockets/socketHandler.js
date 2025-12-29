import db from "../models/index.js";
import {
  handleJoinChat,
  handleLeaveChat,
  handleSendMessage,
  handleTypingStart,
  handleTypingStop,
  handleMessageRead,
} from "./socketEvents.js";

const { User } = db;

const socketHandler = (io, socket) => {
  console.log(`✅ User connected: ${socket.userId} (${socket.id})`);

  // Update user online status
  User.update(
    { isOnline: true, socketId: socket.id, lastSeen: new Date() },
    { where: { id: socket.userId } }
  ).then(() => {
    io.emit("user_online", { userId: socket.userId, socketId: socket.id });
  });

  // Socket event handlers
  socket.on("join_chat", (data) => handleJoinChat(io, socket, data));
  socket.on("leave_chat", (data) => handleLeaveChat(io, socket, data));
  socket.on("send_message", (data) => handleSendMessage(io, socket, data));
  socket.on("typing_start", (data) => handleTypingStart(io, socket, data));
  socket.on("typing_stop", (data) => handleTypingStop(io, socket, data));
  socket.on("message_read", (data) => handleMessageRead(io, socket, data));

  // Disconnect handler
  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.userId} (${socket.id})`);

    await User.update(
      { isOnline: false, socketId: null, lastSeen: new Date() },
      { where: { id: socket.userId } }
    );

    io.emit("user_offline", { userId: socket.userId });
  });

  // Error handler
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "An error occurred" });
  });
};

export default socketHandler;
