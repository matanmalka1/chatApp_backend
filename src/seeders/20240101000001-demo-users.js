import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export default {
  up: async (queryInterface) => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        username: "alice",
        email: "alice@example.com",
        password: hashedPassword,
        first_name: "Alice",
        last_name: "Johnson",
        is_online: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        username: "bob",
        email: "bob@example.com",
        password: hashedPassword,
        first_name: "Bob",
        last_name: "Smith",
        is_online: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        username: "charlie",
        email: "charlie@example.com",
        password: hashedPassword,
        first_name: "Charlie",
        last_name: "Brown",
        is_online: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
