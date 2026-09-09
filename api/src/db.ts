import mysql from 'mysql2/promise';
import { env } from './config/env';

// Pool de conexiones: mysql2 reutiliza conexiones en vez de abrir una nueva
// por cada query (abrir conexión es costoso). El límite de 10 es razonable
// para desarrollo local; en producción se ajusta según carga real.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: 10,
});
