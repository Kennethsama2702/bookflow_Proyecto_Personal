import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Middleware de Express: se ejecuta ANTES que el controller en cualquier ruta
// donde se registre. Si el token no es válido, corta la petición aquí mismo
// (nunca llega al controller ni a la base de datos).
export function requireAuth(authService: AuthService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !/^Bearer\s+\S+$/.test(header)) {
      return res
        .status(401)
        .json({ error: "Falta el header Authorization: Bearer <token>" });
    }
    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = authService.verifyToken(token);
      req.user = { id: payload.sub, email: payload.email };
      next();
    } catch {
      res.status(401).json({ error: "Token inválido o expirado" });
    }
  };
}
