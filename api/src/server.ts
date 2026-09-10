import { buildApp } from "./app";
import { env } from "./config/env";

const { app } = buildApp();

app.listen(env.port, () => {
  console.log(`BookFlow API escuchando en el puerto ${env.port}`);
});
