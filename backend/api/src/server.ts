import { buildApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logging/logger";

const { app } = buildApp();

app.listen(env.port, () => {
  logger.info("api_started", { port: env.port, environment: env.environment });
});
