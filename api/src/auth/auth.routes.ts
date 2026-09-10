import { Router } from "express";
import { AuthController } from "./auth.controller";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/auth/register", controller.register);
  router.post("/auth/login", controller.login);
  return router;
}
