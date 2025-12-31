import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import { initializeSocket } from "./src/config/socket.js";
import db from "./src/models/index.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Test database connection
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await db.sequelize.sync({ alter: false });
    console.log("✅ Database models synchronized.");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server is ready`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
