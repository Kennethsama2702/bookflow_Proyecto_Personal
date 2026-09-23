import assert from "node:assert/strict";
import test from "node:test";
import { redact } from "../src/shared/logging/logger";

process.env.JWT_SECRET = "test-only-secret-that-is-long-enough-32";
process.env.CORS_ORIGINS = "http://localhost:5173";

const { buildApp } = require("../src/app") as typeof import("../src/app");

test("health reports the API as alive", async () => {
  const { app } = buildApp();
  const server = app.listen(0);
  await new Promise<void>((resolve) =>
    server.once("listening", () => resolve()),
  );

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
    assert.match(response.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("health rejects an unconfigured cross-origin request", async () => {
  const { app } = buildApp();
  const server = app.listen(0);
  await new Promise<void>((resolve) =>
    server.once("listening", () => resolve()),
  );

  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/health`, {
      headers: { Origin: "https://attacker.example" },
    });
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("logger redacts credentials and tokens recursively", () => {
  assert.deepEqual(
    redact({
      password: "secret",
      refreshToken: "refresh",
      nested: { authorization: "Bearer private", safe: "value" },
    }),
    {
      password: "[REDACTED]",
      refreshToken: "[REDACTED]",
      nested: { authorization: "[REDACTED]", safe: "value" },
    },
  );
});
