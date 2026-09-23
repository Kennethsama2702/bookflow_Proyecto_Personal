import { ErrorRequestHandler } from "express";
import { DomainError } from "../errors/domain-error";
import { logger } from "../logging/logger";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = req.requestId;

  if (error instanceof DomainError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    });
    return;
  }

  logger.error("unhandled_error", {
    requestId,
    method: req.method,
    path: req.path,
    error,
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocurrio un error interno",
      requestId,
    },
  });
};
