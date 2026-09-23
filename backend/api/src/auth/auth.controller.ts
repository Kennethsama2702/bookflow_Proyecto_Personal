import { Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService } from "./auth.service";
import {
  EmailRegistradoError,
  CredencialesIncorrectasError,
  SesionInvalidaError,
} from "./auth.errors";
import { loginSchema, registerSchema } from "./auth.validation";
import { logger } from "../shared/logging/logger";

const REFRESH_COOKIE = "bookflow_refresh";
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/auth",
  maxAge: 30 * 60 * 1000,
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private metadata(req: Request) {
    return {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    };
  }

  register = async (req: Request, res: Response) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await this.authService.register(
        input.email,
        input.password,
        input.fullName,
        this.metadata(req),
      );
      res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
      res.status(201).json(this.authService.publicAuthResponse(result));
    } catch (err) {
      if (err instanceof EmailRegistradoError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof ZodError) {
        res.status(400).json({ error: "Los datos de registro no son válidos" });
      } else {
        logger.error("auth_register_failed", {
          requestId: req.requestId,
          error: err,
        });
        res.status(500).json({ error: "Error interno" });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await this.authService.login(
        input.email,
        input.password,
        this.metadata(req),
      );
      res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
      res.json(this.authService.publicAuthResponse(result));
    } catch (err) {
      if (err instanceof CredencialesIncorrectasError) {
        res.status(401).json({ error: err.message });
      } else if (err instanceof ZodError) {
        res.status(400).json({ error: "Los datos de acceso no son válidos" });
      } else {
        logger.error("auth_login_failed", {
          requestId: req.requestId,
          error: err,
        });
        res.status(500).json({ error: "Error interno" });
      }
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE];
      if (!refreshToken) throw new SesionInvalidaError();
      const result = await this.authService.refresh(
        refreshToken,
        this.metadata(req),
      );
      res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
      res.json(this.authService.publicAuthResponse(result));
    } catch (err) {
      if (err instanceof SesionInvalidaError) {
        res.status(401).json({ error: err.message });
      } else {
        logger.error("auth_refresh_failed", {
          requestId: req.requestId,
          error: err,
        });
        res.status(500).json({ error: "Error interno" });
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) await this.authService.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: refreshCookieOptions.secure,
      sameSite: refreshCookieOptions.sameSite,
      path: refreshCookieOptions.path,
    });
    res.status(204).send();
  };
}
