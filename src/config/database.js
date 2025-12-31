import dotenv from "dotenv";
dotenv.config();

export default {
  development: {
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  production: {
    dialect: process.env.DB_DIALECT ,
    storage: process.env.DB_STORAGE ,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
};
