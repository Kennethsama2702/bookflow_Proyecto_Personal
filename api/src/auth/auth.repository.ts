import { Pool } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { EmailAlreadyRegisteredError } from './auth.errors';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
}

// Código de error de MySQL para "entrada duplicada" (viola un UNIQUE).
// Es el equivalente al '23505' que usábamos en Postgres -- el nombre y el
// código cambian por completo entre motores, hay que fijarse en la doc de cada uno.
const MYSQL_DUP_ENTRY = 'ER_DUP_ENTRY';

export class AuthRepository {
  constructor(private readonly pool: Pool) {}

  async create(email: string, passwordHash: string, fullName: string): Promise<User> {
    // MySQL no genera UUIDs por sí solo (a diferencia de gen_random_uuid() en
    // Postgres) -- lo generamos aquí, en el código de la aplicación.
    const id = uuidv4();
    try {
      await this.pool.query(
        `INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)`,
        [id, email, passwordHash, fullName],
      );
    } catch (err: any) {
      if (err.code === MYSQL_DUP_ENTRY) {
        throw new EmailAlreadyRegisteredError(email);
      }
      throw err;
    }
    // mysql2 no tiene "RETURNING *" (eso sí es una función de Postgres),
    // así que tras el INSERT hacemos un SELECT explícito para devolver el registro creado.
    return this.findById(id) as Promise<User>;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.query<any[]>(`SELECT * FROM users WHERE email = ?`, [email]);
    return (rows[0] as User) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await this.pool.query<any[]>(`SELECT * FROM users WHERE id = ?`, [id]);
    return (rows[0] as User) ?? null;
  }
}
