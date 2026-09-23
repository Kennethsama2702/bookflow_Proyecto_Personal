import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db";
import { AuthRepository } from "./auth/auth.repository";
import { AuthService } from "./auth/auth.service";
import { AuthController } from "./auth/auth.controller";
import { authRoutes } from "./auth/auth.routes";
import { requireAuth, AuthenticatedRequest } from "./auth/auth.middleware";
import { env } from "./config/env";
import { requestContext } from "./shared/http/request-context";
import { errorHandler } from "./shared/http/error-handler";

export function buildApp() {
  const app = express();
  app.set("trust proxy", env.isProduction ? 1 : false);
  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Demasiados intentos. Intenta de nuevo más tarde." },
  });
  app.use("/auth", authLimiter);

  const authRepository = new AuthRepository(pool);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", async (_req, res, next) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ready", checks: { database: "ok" } });
    } catch (error) {
      next(error);
    }
  });
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
  app.use(errorHandler);
  return { app, authService };
}
