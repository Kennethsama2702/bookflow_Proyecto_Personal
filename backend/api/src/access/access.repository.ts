import { Pool } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Membership {
  organizationId: string;
  userId: string;
  role: string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
}

export class AccessRepository {
  constructor(private readonly pool: Pool) {}

  async createOrganization(
    name: string,
    ownerId: string,
  ): Promise<Organization> {
    const organizationId = uuidv4();
    const membershipId = uuidv4();
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "INSERT INTO organizations (id, name) VALUES (?, ?)",
        [organizationId, name],
      );
      await connection.query(
        `INSERT INTO organization_memberships (id, organization_id, user_id, role_id)
         SELECT ?, ?, ?, id FROM roles WHERE name = 'ADMINISTRADOR'`,
        [membershipId, organizationId, ownerId],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.findOrganizationById(organizationId) as Promise<Organization>;
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    const [rows] = await this.pool.query<any[]>(
      "SELECT id, name, created_at FROM organizations WHERE id = ?",
      [id],
    );
    return (rows[0] as Organization) ?? null;
  }

  async listOrganizationsForUser(userId: string): Promise<Organization[]> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT o.id, o.name, o.created_at, r.name AS role
       FROM organizations o
       JOIN organization_memberships m ON m.organization_id = o.id
       JOIN roles r ON r.id = m.role_id
       WHERE m.user_id = ?
       ORDER BY o.name ASC`,
      [userId],
    );
    return rows as Organization[];
  }

  async findMembership(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT m.organization_id AS organizationId, m.user_id AS userId, r.name AS role
       FROM organization_memberships m
       JOIN roles r ON r.id = m.role_id
       WHERE m.user_id = ? AND m.organization_id = ?`,
      [userId, organizationId],
    );
    return (rows[0] as Membership) ?? null;
  }

  async hasPermission(
    userId: string,
    organizationId: string,
    permission: string,
  ): Promise<boolean> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT 1
       FROM organization_memberships m
       JOIN role_permissions rp ON rp.role_id = m.role_id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE m.user_id = ? AND m.organization_id = ? AND p.name = ?
       LIMIT 1`,
      [userId, organizationId, permission],
    );
    return rows.length > 0;
  }

  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT u.id AS userId, u.email, u.full_name AS fullName, r.name AS role
       FROM organization_memberships m
       JOIN users u ON u.id = m.user_id
       JOIN roles r ON r.id = m.role_id
       WHERE m.organization_id = ?
       ORDER BY u.full_name ASC`,
      [organizationId],
    );
    return rows as OrganizationMember[];
  }

  async addMember(
    organizationId: string,
    email: string,
    role: string,
  ): Promise<boolean> {
    const [result] = await this.pool.query<any>(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role_id)
       SELECT ?, ?, u.id, r.id
       FROM users u CROSS JOIN roles r
       WHERE u.email = ? AND r.name = ?`,
      [uuidv4(), organizationId, email, role],
    );
    return result.affectedRows === 1;
  }

  async changeMemberRole(
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<boolean> {
    const [result] = await this.pool.query<any>(
      `UPDATE organization_memberships m
       JOIN roles r ON r.name = ?
       SET m.role_id = r.id
       WHERE m.organization_id = ? AND m.user_id = ?`,
      [role, organizationId, userId],
    );
    return result.affectedRows === 1;
  }

  async removeMember(organizationId: string, userId: string): Promise<boolean> {
    const [result] = await this.pool.query<any>(
      "DELETE FROM organization_memberships WHERE organization_id = ? AND user_id = ?",
      [organizationId, userId],
    );
    return result.affectedRows === 1;
  }

  async audit(
    actorUserId: string,
    organizationId: string,
    action: string,
    entityId: string | null,
    metadata: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs
        (id, actor_user_id, organization_id, action, entity_type, entity_id, metadata, ip_address)
       VALUES (?, ?, ?, ?, 'organization_membership', ?, ?, ?)`,
      [
        uuidv4(),
        actorUserId,
        organizationId,
        action,
        entityId,
        JSON.stringify(metadata),
        ipAddress ?? null,
      ],
    );
  }

  async listAuditLogs(
    organizationId: string,
    limit = 100,
  ): Promise<AuditLog[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
    const [rows] = await this.pool.query<any[]>(
      `SELECT id, actor_user_id AS actorUserId, action, entity_type AS entityType,
              entity_id AS entityId, metadata, created_at AS createdAt
       FROM audit_logs
       WHERE organization_id = ?
       ORDER BY created_at DESC
       LIMIT ${safeLimit}`,
      [organizationId],
    );
    return rows as AuditLog[];
  }
}
