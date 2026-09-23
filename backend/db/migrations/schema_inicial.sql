-- ============================================================
-- BookFlow — Esquema completo (MySQL 8)
-- Importar en MySQL Workbench: Database > Reverse Engineer > seleccionar este archivo
-- ============================================================

-- ---------- USERS ----------
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Refresh tokens opacos: solo se persiste su hash, nunca el secreto utilizable.
CREATE TABLE auth_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    replaced_by_id CHAR(36) NULL,
    user_agent VARCHAR(512) NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_auth_sessions_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_auth_sessions_replaced_by FOREIGN KEY (replaced_by_id) REFERENCES auth_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions (user_id);
CREATE INDEX idx_auth_sessions_expiry ON auth_sessions (expires_at);

-- ---------- BUSINESSES ----------
CREATE TABLE businesses (
    id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Guayaquil',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_businesses_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ---------- RESOURCES ----------
CREATE TABLE resources (
    id CHAR(36) PRIMARY KEY,
    business_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_resources_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- ---------- BOOKINGS ----------
CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    business_id CHAR(36) NOT NULL,
    resource_id CHAR(36) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
    CONSTRAINT chk_bookings_range CHECK (ends_at > starts_at),
    CONSTRAINT chk_bookings_status CHECK (status IN ('pending','confirmed','cancelled','completed'))
);

-- Columna generada: MySQL no soporta índice único PARCIAL (CREATE UNIQUE INDEX ... WHERE ...,
-- como en Postgres). Esta columna vale NULL si la reserva no está activa, y MySQL sí permite
-- múltiples NULL en una columna con índice único -- así se logra el mismo efecto.
ALTER TABLE bookings ADD COLUMN confirmed_slot_key VARCHAR(200)
    GENERATED ALWAYS AS (
        IF(status IN ('pending','confirmed'), CONCAT(resource_id, '|', starts_at), NULL)
    ) STORED;

CREATE UNIQUE INDEX uq_resource_slot ON bookings (confirmed_slot_key);
CREATE INDEX idx_bookings_business_starts ON bookings (business_id, starts_at);
CREATE INDEX idx_bookings_user ON bookings (user_id);

-- ---------- PAYMENTS ----------
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT uq_payments_booking UNIQUE (booking_id),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0),
    CONSTRAINT chk_payments_status CHECK (status IN ('pending','paid','refunded','failed'))
);

CREATE INDEX idx_payments_status ON payments (status);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NULL,
    user_id CHAR(36) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    sent_at TIMESTAMP NULL,
    CONSTRAINT fk_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notifications_channel CHECK (channel IN ('email','sms','push'))
);

-- ---------- MESSAGES (chat) ----------
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY,
    resource_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_resource_created ON messages (resource_id, created_at);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Al confirmar una reserva, crea automáticamente el registro de pago pendiente.
DELIMITER //
CREATE TRIGGER trg_booking_confirmed
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
        INSERT IGNORE INTO payments (id, booking_id, amount, status)
        VALUES (UUID(), NEW.id, 0, 'pending');
    END IF;
END//
DELIMITER ;

-- Evita modificar una reserva ya cancelada.
DELIMITER //
CREATE TRIGGER trg_block_cancelled_edit
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede modificar una reserva cancelada';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- VISTAS
-- ============================================================

CREATE VIEW v_daily_revenue AS
SELECT
    b.business_id,
    DATE(p.paid_at) AS day,
    SUM(p.amount) AS revenue,
    COUNT(*) AS paid_bookings
FROM payments p
JOIN bookings b ON b.id = p.booking_id
WHERE p.status = 'paid'
GROUP BY b.business_id, DATE(p.paid_at);

-- MySQL NO tiene vistas materializadas (a diferencia de Postgres). Esta es una
-- vista normal: se recalcula en cada consulta, no queda cacheada en disco.
-- El equivalente real a una vista materializada en MySQL es: una tabla resumen
-- + un EVENT programado (Event Scheduler) que la repuebla periódicamente.
CREATE VIEW v_monthly_summary AS
SELECT
    business_id,
    DATE_FORMAT(starts_at, '%Y-%m-01') AS month,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
    ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS cancel_rate
FROM bookings
GROUP BY business_id, DATE_FORMAT(starts_at, '%Y-%m-01');