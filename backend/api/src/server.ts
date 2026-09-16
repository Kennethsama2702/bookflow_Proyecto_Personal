import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db";

const { app } = buildApp();

async function testDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL conectado correctamente");
    connection.release();
  } catch (error) {
    console.error("Error conectando MySQL:", error);
  }
}

testDatabase();

app.listen(env.port, () => {
  console.log(`BookFlow API escuchando en el puerto ${env.port}`);
});
