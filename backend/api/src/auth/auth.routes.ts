import { Router } from "express";
import { AuthController } from "./auth.controller";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/auth/register", controller.register);
  router.post("/auth/login", controller.login);
  router.post("/auth/refresh", controller.refresh);
  router.post("/auth/logout", controller.logout);
  return router;
}
