import db from "../models/index.js";

const { Message, User, Chat } = db;

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is member of chat
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: User, as: "users", where: { id: req.user.id } }],
    });

    if (!chat) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const messages = await Message.findAndCountAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      messages: messages.rows.reverse(),
      total: messages.count,
      page: parseInt(page),
      totalPages: Math.ceil(messages.count / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content, type = "text" } = req.body;

    // Verify user is member of chat
    const chat = await Chat.findByPk(chatId, {
      include: [{ model: User, as: "users", where: { id: req.user.id } }],
    });

    if (!chat) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const message = await Message.create({
      chatId,
      userId: req.user.id,
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

    res.status(201).json({ message: "Message sent", data: completeMessage });
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow sender to update
    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await message.update({ content });

    res.json({ message: "Message updated", data: message });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow sender to delete
    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await message.destroy();

    res.json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};
