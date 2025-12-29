import { v4 as uuidv4 } from "uuid";

export default {
  up: async (queryInterface) => {
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users LIMIT 3",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length < 2) {
      console.log("Not enough users to create chats. Run user seeder first.");
      return;
    }

    const chatId = uuidv4();
    const now = new Date();

    // Create a chat
    await queryInterface.bulkInsert("chats", [
      {
        id: chatId,
        name: "General Chat",
        is_group: true,
        created_by: users[0].id,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Add users to chat
    await queryInterface.bulkInsert("user_chats", [
      {
        id: uuidv4(),
        user_id: users[0].id,
        chat_id: chatId,
        role: "admin",
        joined_at: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        user_id: users[1].id,
        chat_id: chatId,
        role: "member",
        joined_at: now,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Add some messages
    await queryInterface.bulkInsert("messages", [
      {
        id: uuidv4(),
        chat_id: chatId,
        user_id: users[0].id,
        content: "Hello everyone!",
        type: "text",
        is_read: false,
        read_by: "[]",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        chat_id: chatId,
        user_id: users[1].id,
        content: "Hi! How are you?",
        type: "text",
        is_read: false,
        read_by: "[]",
        created_at: new Date(now.getTime() + 60000),
        updated_at: new Date(now.getTime() + 60000),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("messages", null, {});
    await queryInterface.bulkDelete("user_chats", null, {});
    await queryInterface.bulkDelete("chats", null, {});
  },
};
