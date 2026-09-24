ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL;

CREATE TABLE auth_action_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_auth_action_token_hash UNIQUE (token_hash),
    CONSTRAINT chk_auth_action_token_purpose CHECK (purpose IN ('email_verification','password_reset')),
    CONSTRAINT fk_auth_action_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_action_tokens_user_purpose ON auth_action_tokens (user_id, purpose);
CREATE INDEX idx_auth_action_tokens_expiry ON auth_action_tokens (expires_at);

CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY,
    actor_user_id CHAR(36) NULL,
    organization_id CHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id CHAR(36) NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_org_created ON audit_logs (organization_id, created_at);
CREATE INDEX idx_audit_logs_actor_created ON audit_logs (actor_user_id, created_at);
