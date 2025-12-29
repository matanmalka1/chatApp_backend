import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chatId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "chats",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("text", "image", "file"),
        defaultValue: "text",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readBy: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      tableName: "messages",
      timestamps: true,
      underscored: true,
    }
  );

  return Message;
};
