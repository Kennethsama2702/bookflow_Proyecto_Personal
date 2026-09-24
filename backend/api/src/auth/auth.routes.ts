import { Router } from "express";
import { AuthController } from "./auth.controller";
import { csrfProtection } from "./csrf.middleware";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/auth/register", controller.register);
  router.post("/auth/login", controller.login);
  router.post("/auth/password-reset/request", controller.requestPasswordReset);
  router.post("/auth/password-reset/confirm", controller.resetPassword);
  router.post("/auth/email/verify", controller.verifyEmail);
  router.post("/auth/refresh", csrfProtection, controller.refresh);
  router.post("/auth/logout", csrfProtection, controller.logout);
  return router;
}
