-- Corrige duplicados de membresías a nivel de negocio (branch_id NULL).
ALTER TABLE tenant_memberships
    ADD COLUMN branch_key BINARY(16)
        GENERATED ALWAYS AS (COALESCE(branch_id, 0x00000000000000000000000000000000)) STORED NOT NULL
        AFTER branch_id,
    ADD UNIQUE KEY uq_membership_context_branch_key (tenant_id, user_id, role, branch_key);

CREATE TABLE customers (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    branch_id BINARY(16) NULL,
    user_id BINARY(16) NULL,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(254) NULL,
    phone VARCHAR(32) NULL,
    date_of_birth DATE NULL,
    emergency_contact_name VARCHAR(160) NULL,
    emergency_contact_phone VARCHAR(32) NULL,
    emergency_contact_relationship VARCHAR(60) NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_tenant_id (tenant_id, id),
    UNIQUE KEY uq_customers_tenant_email (tenant_id, email),
    UNIQUE KEY uq_customers_tenant_user (tenant_id, user_id),
    KEY ix_customers_tenant_status_created (tenant_id, status, created_at),
    CONSTRAINT fk_customers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_customers_branch_tenant FOREIGN KEY (tenant_id, branch_id) REFERENCES branches (tenant_id, id),
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_customers_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_customers_emergency_pair CHECK ((emergency_contact_name IS NULL) = (emergency_contact_phone IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customer_guardians (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    customer_id BINARY(16) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    relationship VARCHAR(60) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(254) NULL,
    consent_given_at TIMESTAMP(6) NOT NULL,
    consent_recorded_by BINARY(16) NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY ix_guardians_tenant_customer (tenant_id, customer_id, status),
    CONSTRAINT fk_guardians_customer_tenant FOREIGN KEY (tenant_id, customer_id) REFERENCES customers (tenant_id, id),
    CONSTRAINT fk_guardians_recorded_by FOREIGN KEY (consent_recorded_by) REFERENCES users (id),
    CONSTRAINT chk_guardians_status CHECK (status IN ('ACTIVE', 'REVOKED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;