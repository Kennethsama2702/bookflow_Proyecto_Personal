import express from "express";
import cors from "cors";
import { pool } from "./db";
import { AuthRepository } from "./auth/auth.repository";
import { AuthService } from "./auth/auth.service";
import { AuthController } from "./auth/auth.controller";
import { authRoutes } from "./auth/auth.routes";
import { requireAuth, AuthenticatedRequest } from "./auth/auth.middleware";

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const authRepository = new AuthRepository(pool);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(authRoutes(authController));

  // Ruta protegida de ejemplo: confirma que requireAuth funciona de punta a
  // punta antes de que exista bookings. Bookings la va a usar igual más adelante.
  app.get(
    "/me",
    requireAuth(authService),
    async (req: AuthenticatedRequest, res) => {
      const user = await authRepository.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({
        user: { id: user.id, email: user.email, fullName: user.full_name },
      });
    },
  );
  return { app, authService };
}
