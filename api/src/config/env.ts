// dotenv/config lee el archivo .env de la raíz de api/ y llena process.env
// ANTES de que el resto de este archivo se ejecute. Sin esta línea, .env
// existiría pero Node nunca lo leería.
import "dotenv/config";

// Centraliza TODAS las variables de entorno en un solo lugar.
// Ventaja: si falta una, te enteras al arrancar la app (falla rápido y claro),
// no a mitad de una request cuando ya es tarde para diagnosticarlo fácil.

export const env = {
  port: Number(process.env.PORT ?? 3000),

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "proyecto_personal",
  },

  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-cambiar-en-produccion",
};
