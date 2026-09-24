import { Request, Response } from "express";
import { ZodError } from "zod";
import { AccessRepository } from "./access.repository";
import {
  addMemberSchema,
  changeMemberRoleSchema,
} from "./membership.validation";
import { OrganizationRequest } from "./access.middleware";

export class MembershipController {
  constructor(private readonly accessRepository: AccessRepository) {}

  list = async (req: OrganizationRequest, res: Response) => {
    res.json({
      members: await this.accessRepository.listMembers(
        req.params.organizationId,
      ),
    });
  };

  add = async (req: OrganizationRequest, res: Response) => {
    try {
      const input = addMemberSchema.parse(req.body);
      const added = await this.accessRepository.addMember(
        req.params.organizationId,
        input.email,
        input.role,
      );
      if (!added)
        return res.status(404).json({ error: "Usuario o rol no encontrado" });
      await this.accessRepository.audit(
        req.user!.id,
        req.params.organizationId,
        "organization.member_added",
        null,
        { email: input.email, role: input.role },
        req.ip,
      );
      res.status(201).json({ message: "Miembro agregado" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Los datos no son válidos" });
      }
      throw error;
    }
  };

  changeRole = async (req: OrganizationRequest, res: Response) => {
    try {
      const input = changeMemberRoleSchema.parse(req.body);
      const changed = await this.accessRepository.changeMemberRole(
        req.params.organizationId,
        req.params.userId,
        input.role,
      );
      if (!changed)
        return res.status(404).json({ error: "Miembro no encontrado" });
      await this.accessRepository.audit(
        req.user!.id,
        req.params.organizationId,
        "organization.member_role_changed",
        req.params.userId,
        { role: input.role },
        req.ip,
      );
      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Los datos no son válidos" });
      }
      throw error;
    }
  };

  remove = async (req: OrganizationRequest, res: Response) => {
    const removed = await this.accessRepository.removeMember(
      req.params.organizationId,
      req.params.userId,
    );
    if (!removed)
      return res.status(404).json({ error: "Miembro no encontrado" });
    await this.accessRepository.audit(
      req.user!.id,
      req.params.organizationId,
      "organization.member_removed",
      req.params.userId,
      {},
      req.ip,
    );
    res.status(204).send();
  };
}
