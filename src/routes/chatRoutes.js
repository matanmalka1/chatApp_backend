import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getChats);
router.post("/", createChat);
router.get("/:id", getChatById);
router.put("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;
