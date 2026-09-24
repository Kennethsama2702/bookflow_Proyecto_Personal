import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

const CSRF_COOKIE = "bookflow_csrf";
const CSRF_HEADER = "x-csrf-token";

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      error: { code: "CSRF_REQUIRED", message: "Token CSRF requerido" },
    });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    return res.status(403).json({
      success: false,
      error: { code: "CSRF_INVALID", message: "Token CSRF inválido" },
    });
  }
  next();
}

export { CSRF_COOKIE };
