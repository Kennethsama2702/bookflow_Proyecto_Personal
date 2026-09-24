import { NextFunction, Response } from "express";
import { AccessRepository } from "./access.repository";
import { AuthenticatedRequest } from "../auth/auth.middleware";

export interface OrganizationRequest extends AuthenticatedRequest {
  organization?: { id: string; role: string };
}

export function requirePermission(
  accessRepository: AccessRepository,
  permission: string,
) {
  return async (
    req: OrganizationRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const organizationId = req.header("x-organization-id")?.trim();
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "ORGANIZATION_REQUIRED",
          message: "Falta X-Organization-Id",
        },
      });
    }
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Autenticación requerida",
        },
      });
    }

    try {
      const allowed = await accessRepository.hasPermission(
        req.user.id,
        organizationId,
        permission,
      );
      if (!allowed) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "No tienes permisos para esta operación",
          },
        });
      }
      const membership = await accessRepository.findMembership(
        req.user.id,
        organizationId,
      );
      req.organization = { id: organizationId, role: membership!.role };
      next();
    } catch (error) {
      next(error);
    }
  };
}
