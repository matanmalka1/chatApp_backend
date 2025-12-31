import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";
import socketHandler from "../sockets/socketHandler.js";

export const initializeSocket = (server) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket authentication middleware
  io.use(socketAuthMiddleware);

  // Socket event handlers
  io.on("connection", (socket) => {
    socketHandler(io, socket);
  });

  return io;
};
