import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./index.js";
dotenv.config();

export const sequelize = new Sequelize(
  config.DATABASE_NAME,
  config.DATABASE_USERNAME,
  config.DATABASE_PASSWORD,
  {
    host: config.DATABASE_HOST, 
    port: config.DATABASE_PORT,
    dialect: config.DATABASE_DIALECT,
    logging: (msg) => console.log(msg), // Enable logging for debugging
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate(); 
    await sequelize.sync({ alter: true }); // Sync models with the database
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default {sequelize};