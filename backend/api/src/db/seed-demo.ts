import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";
import { databaseConfig } from "../config/database";

const DEMO_ORGANIZATION = process.env.DEMO_ORGANIZATION ?? "Cinefilo";
const DEMO_USERS = [
  {
    key: "ADMIN",
    email: process.env.DEMO_ADMIN_EMAIL ?? "admin.demo@bookflow.local",
    password: process.env.DEMO_ADMIN_PASSWORD ?? "AdminDemo12345",
    name: "Admin Demo",
    role: "ADMINISTRADOR",
  },
  {
    key: "SUPERVISOR",
    email:
      process.env.DEMO_SUPERVISOR_EMAIL ?? "supervisor.demo@bookflow.local",
    password: process.env.DEMO_SUPERVISOR_PASSWORD ?? "SupervisorDemo12345",
    name: "Supervisor Demo",
    role: "SUPERVISOR",
  },
  {
    key: "ACCESO",
    email: process.env.DEMO_ACCESO_EMAIL ?? "acceso.demo@bookflow.local",
    password: process.env.DEMO_ACCESO_PASSWORD ?? "AccesoDemo12345",
    name: "Personal Acceso Demo",
    role: "PERSONAL_ACCESO",
  },
  {
    key: "CONFITERIA",
    email:
      process.env.DEMO_CONFITERIA_EMAIL ?? "confiteria.demo@bookflow.local",
    password: process.env.DEMO_CONFITERIA_PASSWORD ?? "ConfiteriaDemo12345",
    name: "Personal Confiteria Demo",
    role: "PERSONAL_CONFITERIA",
  },
  {
    key: "CLIENTE",
    email: process.env.DEMO_CLIENTE_EMAIL ?? "cliente.demo@bookflow.local",
    password: process.env.DEMO_CLIENTE_PASSWORD ?? "ClienteDemo12345",
    name: "Cliente Demo",
    role: "CLIENTE",
  },
];

async function main() {
  const connection = await mysql.createConnection(databaseConfig);
  try {
    await connection.beginTransaction();
    await connection.query(
      "INSERT INTO organizations (id, name) VALUES (UUID(), ?) ON DUPLICATE KEY UPDATE id = id",
      [DEMO_ORGANIZATION],
    );
    const [organizationRows] = await connection.query<any[]>(
      "SELECT id FROM organizations WHERE name = ?",
      [DEMO_ORGANIZATION],
    );
    const organizationId = organizationRows[0].id;

    for (const demoUser of DEMO_USERS) {
      const passwordHash = await bcrypt.hash(demoUser.password, 10);
      await connection.query(
        `INSERT INTO users (id, email, password_hash, full_name, email_verified_at)
         VALUES (UUID(), ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), email_verified_at = CURRENT_TIMESTAMP`,
        [demoUser.email, passwordHash, demoUser.name],
      );
      const [userRows] = await connection.query<any[]>(
        "SELECT id FROM users WHERE email = ?",
        [demoUser.email],
      );
      await connection.query(
        `INSERT INTO organization_memberships (id, organization_id, user_id, role_id)
         SELECT ?, ?, ?, r.id FROM roles r WHERE r.name = ?
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
        [randomUUID(), organizationId, userRows[0].id, demoUser.role],
      );
    }
    await connection.commit();
    console.log(`Usuarios demo creados en: ${DEMO_ORGANIZATION}`);
    for (const demoUser of DEMO_USERS)
      console.log(`${demoUser.key}: ${demoUser.email} / ${demoUser.password}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
