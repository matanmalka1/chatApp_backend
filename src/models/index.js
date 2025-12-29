import { Sequelize } from "sequelize";
import config from "../config/database.js";
import UserModel from "./User.js";
import ChatModel from "./Chat.js";
import MessageModel from "./Message.js";
import RefreshTokenModel from "./RefreshToken.js";
import UserChatModel from "./UserChat.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize({
  ...dbConfig,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Initialize models
const User = UserModel(sequelize);
const Chat = ChatModel(sequelize);
const Message = MessageModel(sequelize);
const RefreshToken = RefreshTokenModel(sequelize);
const UserChat = UserChatModel(sequelize);

// Define associations
User.hasMany(Message, { foreignKey: "userId", as: "messages" });
Message.belongsTo(User, { foreignKey: "userId", as: "sender" });

Chat.hasMany(Message, { foreignKey: "chatId", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });

User.belongsToMany(Chat, {
  through: UserChat,
  foreignKey: "userId",
  as: "chats",
});
Chat.belongsToMany(User, {
  through: UserChat,
  foreignKey: "chatId",
  as: "users",
});

User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

const db = {
  sequelize,
  Sequelize,
  User,
  Chat,
  Message,
  RefreshToken,
  UserChat,
};

export default db;
