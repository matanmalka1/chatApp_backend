import express from "express";
import {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:chatId", getMessages);
router.post("/", sendMessage);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

export default router;
