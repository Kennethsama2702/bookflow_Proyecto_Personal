import dotenv from "dotenv";

const environment = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${environment}` });
dotenv.config();

export const databaseConfig = {
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "proyecto_personal",
};
