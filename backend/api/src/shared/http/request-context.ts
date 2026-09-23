import { randomUUID } from "crypto";
import { RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = req.header("x-request-id")?.trim() || randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
