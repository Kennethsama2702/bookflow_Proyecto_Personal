import { Request, Response } from "express";
import { ZodError } from "zod";
import { AccessRepository } from "./access.repository";
import { createOrganizationSchema } from "./organization.validation";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { OrganizationRequest } from "./access.middleware";

export class OrganizationController {
  constructor(private readonly accessRepository: AccessRepository) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const input = createOrganizationSchema.parse(req.body);
      const organization = await this.accessRepository.createOrganization(
        input.name,
        req.user!.id,
      );
      res.status(201).json({ organization });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Los datos no son válidos",
          },
        });
      }
      throw error;
    }
  };

  list = async (req: AuthenticatedRequest, res: Response) => {
    const organizations = await this.accessRepository.listOrganizationsForUser(
      req.user!.id,
    );
    res.json({ organizations });
  };

  get = async (req: Request, res: Response) => {
    const organization = await this.accessRepository.findOrganizationById(
      req.params.organizationId,
    );
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ORGANIZATION_NOT_FOUND",
          message: "Organización no encontrada",
        },
      });
    }
    res.json({ organization });
  };

  audit = async (req: OrganizationRequest, res: Response) => {
    const limit = Number(req.query.limit ?? 100);
    const auditLogs = await this.accessRepository.listAuditLogs(
      req.params.organizationId,
      limit,
    );
    res.json({ auditLogs });
  };
}
