// dotenv/config lee el archivo .env de la raíz de api/ y llena process.env
// ANTES de que el resto de este archivo se ejecute. Sin esta línea, .env
// existiría pero Node nunca lo leería.
import dotenv from "dotenv";

const environment = process.env.NODE_ENV ?? "development";
if (
  !(["development", "test", "production"] as const).includes(
    environment as never,
  )
) {
  throw new Error("NODE_ENV debe ser development, test o production");
}

dotenv.config({ path: `.env.${environment}` });
dotenv.config();

function requiredEnv(name: string, minimumLength = 1): string {
  const value = process.env[name]?.trim();
  if (!value || value.length < minimumLength) {
    throw new Error(
      `${name} es obligatorio y debe tener al menos ${minimumLength} caracteres`,
    );
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = requiredEnv("JWT_SECRET", 32);
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  environment: environment as "development" | "test" | "production",
  isProduction: environment === "production",
  port: Number(process.env.PORT ?? 3000),

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "proyecto_personal",
  },

  jwtSecret,
  jwtIssuer: process.env.JWT_ISSUER ?? "bookflow-api",
  jwtAudience: process.env.JWT_AUDIENCE ?? "bookflow-web",
  corsOrigins: allowedOrigins,
};
