import { Router } from "express";
import { AuthService } from "../auth/auth.service";
import { requireAuth } from "../auth/auth.middleware";
import { AccessRepository } from "./access.repository";
import { requirePermission } from "./access.middleware";
import { OrganizationController } from "./organization.controller";
import { asyncHandler } from "../shared/http/async-handler";
import { MembershipController } from "./membership.controller";

export function organizationRoutes(
  authService: AuthService,
  accessRepository: AccessRepository,
): Router {
  const router = Router();
  const controller = new OrganizationController(accessRepository);
  const membershipController = new MembershipController(accessRepository);
  const authenticated = requireAuth(authService);

  router.post("/organizations", authenticated, asyncHandler(controller.create));
  router.get("/organizations", authenticated, asyncHandler(controller.list));
  router.get(
    "/organizations/:organizationId",
    authenticated,
    requirePermission(accessRepository, "organization:read"),
    asyncHandler(controller.get),
  );
  const manageMembers = [
    authenticated,
    requirePermission(accessRepository, "users:manage"),
  ] as const;
  router.get(
    "/organizations/:organizationId/members",
    authenticated,
    requirePermission(accessRepository, "users:read"),
    asyncHandler(membershipController.list),
  );
  router.post(
    "/organizations/:organizationId/members",
    ...manageMembers,
    asyncHandler(membershipController.add),
  );
  router.patch(
    "/organizations/:organizationId/members/:userId/role",
    ...manageMembers,
    asyncHandler(membershipController.changeRole),
  );
  router.delete(
    "/organizations/:organizationId/members/:userId",
    ...manageMembers,
    asyncHandler(membershipController.remove),
  );
  router.get(
    "/organizations/:organizationId/audit-logs",
    authenticated,
    requirePermission(accessRepository, "audit:read"),
    asyncHandler(controller.audit),
  );
  return router;
}
