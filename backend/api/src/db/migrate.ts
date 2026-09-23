import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import mysql from "mysql2/promise";
import { databaseConfig } from "../config/database";
import { logger } from "../shared/logging/logger";

const migrationsDirectory = join(__dirname, "../../../db/migrations");
const baselineName = "schema_inicial.sql";

function checksum(contents: string) {
  return createHash("sha256").update(contents).digest("hex");
}

async function migrationFiles() {
  const { readdir } = await import("fs/promises");
  const names = (await readdir(migrationsDirectory))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    );
  return Promise.all(
    names.map(async (name) => {
      const contents = await readFile(join(migrationsDirectory, name), "utf8");
      return { name, contents, checksum: checksum(contents) };
    }),
  );
}

async function main() {
  const connection = await mysql.createConnection({
    ...databaseConfig,
    multipleStatements: true,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [appliedRows] = await connection.query<any[]>(
      "SELECT version, checksum FROM schema_migrations",
    );
    const applied = new Map<string, string>(
      appliedRows.map((row) => [row.version, row.checksum]),
    );

    if (applied.size === 0) {
      const [usersRows] = await connection.query<any[]>(
        "SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'",
      );
      if (usersRows[0].total === 0) {
        throw new Error(
          "La base no tiene el baseline schema_inicial.sql. Aplícalo una vez antes de ejecutar npm run migrate.",
        );
      }

      const baseline = await readFile(
        join(migrationsDirectory, baselineName),
        "utf8",
      );
      await connection.query(
        "INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)",
        [baselineName, checksum(baseline)],
      );
      applied.set(baselineName, checksum(baseline));
      logger.info("migration_baseline_registered", { version: baselineName });
    }

    for (const migration of await migrationFiles()) {
      const previousChecksum = applied.get(migration.name);
      if (previousChecksum) {
        if (previousChecksum !== migration.checksum) {
          throw new Error(
            `La migración ${basename(migration.name)} cambió después de aplicarse`,
          );
        }
        continue;
      }

      if (migration.name === "002_auth_sessions.sql") {
        const [sessionTableRows] = await connection.query<any[]>(
          "SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'auth_sessions'",
        );
        if (sessionTableRows[0].total === 1) {
          await connection.query(
            "INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)",
            [migration.name, migration.checksum],
          );
          applied.set(migration.name, migration.checksum);
          logger.info("migration_legacy_object_detected", {
            version: migration.name,
          });
          continue;
        }
      }

      await connection.beginTransaction();
      try {
        await connection.query(migration.contents);
        await connection.query(
          "INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)",
          [migration.name, migration.checksum],
        );
        await connection.commit();
        logger.info("migration_applied", { version: migration.name });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  logger.error("migration_failed", { error });
  process.exitCode = 1;
});
