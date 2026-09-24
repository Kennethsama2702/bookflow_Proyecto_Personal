import assert from "node:assert/strict";
import test from "node:test";
import { requirePermission } from "../src/access/access.middleware";

function responseDouble() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}

const request = {
  user: { id: "user-a", email: "a@example.com" },
  header(name: string) {
    return name === "x-organization-id" ? "org-a" : undefined;
  },
};

test("RBAC rejects a user without the requested permission", async () => {
  const response = responseDouble();
  let nextCalled = false;
  const repository = {
    hasPermission: async () => false,
    findMembership: async () => null,
  };

  await requirePermission(repository as never, "catalog:manage")(
    request as never,
    response as never,
    () => {
      nextCalled = true;
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("RBAC attaches the organization and role for an allowed member", async () => {
  const response = responseDouble();
  let nextCalled = false;
  const repository = {
    hasPermission: async () => true,
    findMembership: async () => ({
      organizationId: "org-a",
      userId: "user-a",
      role: "SUPERVISOR",
    }),
  };
  const mutableRequest = { ...request } as Record<string, unknown>;

  await requirePermission(repository as never, "catalog:read")(
    mutableRequest as never,
    response as never,
    () => {
      nextCalled = true;
    },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(mutableRequest.organization, {
    id: "org-a",
    role: "SUPERVISOR",
  });
});
