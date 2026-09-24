import assert from "node:assert/strict";
import test from "node:test";
import { AuthService } from "../src/auth/auth.service";

const user = {
  id: "user-1",
  email: "user@example.com",
  password_hash: "stored-hash",
  full_name: "User Example",
  created_at: new Date().toISOString(),
};

test("password reset token is single-use", async () => {
  let savedHash = "";
  let consumed = false;
  let updatedPassword = "";
  let notificationToken = "";
  const repository = {
    findByEmail: async () => user,
    createActionToken: async (_userId: string, tokenHash: string) => {
      savedHash = tokenHash;
    },
    consumeActionToken: async (tokenHash: string) => {
      if (consumed || tokenHash !== savedHash) return null;
      consumed = true;
      return user.id;
    },
    updatePassword: async (_userId: string, hash: string) => {
      updatedPassword = hash;
    },
  };
  const notifications = {
    sendPasswordReset: async (_email: string, token: string) => {
      notificationToken = token;
    },
  };
  const service = new AuthService(repository as never, notifications as never);

  await service.requestPasswordReset(user.email);
  assert.ok(notificationToken);
  assert.ok(savedHash);
  assert.equal(
    await service.resetPassword(notificationToken, "NewPassword123"),
    true,
  );
  assert.equal(
    await service.resetPassword(notificationToken, "NewPassword123"),
    false,
  );
  assert.ok(updatedPassword);
});
