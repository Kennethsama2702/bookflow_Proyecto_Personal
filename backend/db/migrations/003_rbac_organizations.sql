CREATE TABLE IF NOT EXISTS organizations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organizations_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT uq_permissions_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organization_memberships (
    id CHAR(36) PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organization_membership UNIQUE (organization_id, user_id),
    CONSTRAINT fk_memberships_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_memberships_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_memberships_user ON organization_memberships (user_id);
CREATE INDEX idx_memberships_org_role ON organization_memberships (organization_id, role_id);

INSERT IGNORE INTO roles (id, name) VALUES
    (UUID(), 'ADMINISTRADOR'),
    (UUID(), 'SUPERVISOR'),
    (UUID(), 'PERSONAL_ACCESO'),
    (UUID(), 'PERSONAL_CONFITERIA'),
    (UUID(), 'CLIENTE');

INSERT IGNORE INTO permissions (id, name) VALUES
    (UUID(), 'organization:read'),
    (UUID(), 'organization:manage'),
    (UUID(), 'users:read'),
    (UUID(), 'users:manage'),
    (UUID(), 'catalog:read'),
    (UUID(), 'catalog:manage'),
    (UUID(), 'bookings:read'),
    (UUID(), 'bookings:manage'),
    (UUID(), 'tickets:validate'),
    (UUID(), 'concessions:manage'),
    (UUID(), 'reports:read');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ADMINISTRADOR';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.name = 'SUPERVISOR'
  AND p.name IN ('organization:read','users:read','catalog:read','catalog:manage','bookings:read','bookings:manage','concessions:manage','reports:read');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.name = 'PERSONAL_ACCESO'
  AND p.name IN ('organization:read','catalog:read','bookings:read','tickets:validate');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.name = 'PERSONAL_CONFITERIA'
  AND p.name IN ('organization:read','concessions:manage','bookings:read');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.name = 'CLIENTE'
  AND p.name IN ('organization:read','catalog:read','bookings:read');
