CREATE TABLE users (
    id BINARY(16) NOT NULL,
    cognito_subject VARCHAR(128) NOT NULL,
    email VARCHAR(254) NOT NULL,
    display_name VARCHAR(160) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_cognito_subject (cognito_subject),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INVITED', 'SUSPENDED', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tenants (
    id BINARY(16) NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    business_type VARCHAR(80) NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    time_zone VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_tenants_slug (slug),
    KEY ix_tenants_status_created (status, created_at),
    CONSTRAINT chk_tenants_status CHECK (status IN ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CLOSED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE branches (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    address_line VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    phone VARCHAR(32) NULL,
    time_zone VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_branches_tenant_name (tenant_id, name),
    UNIQUE KEY uq_branches_tenant_id (tenant_id, id),
    KEY ix_branches_tenant_status_created (tenant_id, status, created_at),
    CONSTRAINT fk_branches_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT chk_branches_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tenant_memberships (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    branch_id BINARY(16) NULL,
    role VARCHAR(40) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_membership_context (tenant_id, user_id, role, branch_id),
    KEY ix_memberships_user_status (user_id, status, tenant_id),
    KEY ix_memberships_tenant_status (tenant_id, status, role),
    CONSTRAINT fk_memberships_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_memberships_branch_tenant FOREIGN KEY (tenant_id, branch_id) REFERENCES branches (tenant_id, id),
    CONSTRAINT chk_memberships_role CHECK (role IN ('BUSINESS_OWNER', 'BUSINESS_ADMIN', 'MANAGER', 'RECEPTIONIST', 'INSTRUCTOR', 'CUSTOMER')),
    CONSTRAINT chk_memberships_status CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE platform_admins (
    user_id BINARY(16) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'SUPER_ADMIN',
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id),
    CONSTRAINT fk_platform_admins_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_platform_admins_role CHECK (role IN ('SUPER_ADMIN')),
    CONSTRAINT chk_platform_admins_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE tenant_settings (
    tenant_id BINARY(16) NOT NULL,
    settings_json JSON NOT NULL,
    updated_by BINARY(16) NULL,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (tenant_id),
    CONSTRAINT fk_tenant_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_tenant_settings_user FOREIGN KEY (updated_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE audit_events (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NULL,
    actor_user_id BINARY(16) NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id BINARY(16) NULL,
    details_json JSON NULL,
    correlation_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY ix_audit_tenant_created (tenant_id, created_at),
    KEY ix_audit_actor_created (actor_user_id, created_at),
    KEY ix_audit_resource (resource_type, resource_id, created_at),
    CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
