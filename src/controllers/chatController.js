import db from "../models/index.js";

const { Chat, User, UserChat, Message } = db;

export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: "users",
          attributes: { exclude: ["password"] },
          through: { attributes: ["role", "joinedAt"] },
        },
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "username", "avatar"],
            },
          ],
        },
      ],
      where: { "$users.id$": req.user.id },
      order: [["updatedAt", "DESC"]],
    });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "users",
          attributes: { exclude: ["password"] },
          through: { attributes: ["role", "joinedAt"] },
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is a member
    const isMember = chat.users.some((user) => user.id === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const { name, isGroup, userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ error: "At least one user required" });
    }

    // Create chat
    const chat = await Chat.create({
      name: isGroup ? name : null,
      isGroup: isGroup || false,
      createdBy: req.user.id,
    });

    // Add creator to chat
    await UserChat.create({
      userId: req.user.id,
      chatId: chat.id,
      role: "admin",
    });

    // Add other users
    for (const userId of userIds) {
      if (userId !== req.user.id) {
        await UserChat.create({
          userId,
          chatId: chat.id,
          role: "member",
        });
      }
    }

    // Fetch complete chat with users
    const completeChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: "users",
          attributes: { exclude: ["password"] },
          through: { attributes: ["role"] },
        },
      ],
    });

    res
      .status(201)
      .json({ message: "Chat created successfully", chat: completeChat });
  } catch (error) {
    next(error);
  }
};

export const updateChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;

    const chat = await Chat.findByPk(id, {
      include: [
        {
          model: User,
          as: "users",
          through: { attributes: ["role"] },
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is admin
    const userChat = chat.users.find((u) => u.id === req.user.id);
    if (!userChat || userChat.UserChat.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update chat" });
    }

    await chat.update({ name, avatar });

    res.json({ message: "Chat updated successfully", chat });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findByPk(id, {
      include: [
        {
          model: User,
          as: "users",
          through: { attributes: ["role"] },
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is admin
    const userChat = chat.users.find((u) => u.id === req.user.id);
    if (!userChat || userChat.UserChat.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete chat" });
    }

    await chat.destroy();

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    next(error);
  }
};
