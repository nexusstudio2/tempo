package com.koaliado.tempo.shared.tenancy;

import java.util.HashSet;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TenantAccessService {
    private final JdbcClient jdbc;

    public TenantAccessService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Valida que el usuario del token tenga membresia activa en el tenant pedido.
     * Nunca confia en el header.
     */
    public TenantContext resolve(String cognitoSubject, String tenantHeader) {
        if (tenantHeader == null || tenantHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el header X-Tenant-Id.");
        }
        UUID tenantId;
        try {
            tenantId = UUID.fromString(tenantHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Tenant-Id invalido.");
        }
        UUID userId = jdbc.sql("SELECT id FROM users WHERE cognito_subject = :sub AND status = 'ACTIVE'")
                .param("sub", cognitoSubject)
                .query((rs, i) -> UuidBytes.toUuid(rs.getBytes("id")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado."));

        var roles = new HashSet<>(jdbc.sql(
                "SELECT m.role FROM tenant_memberships m JOIN tenants t ON t.id = m.tenant_id "
                        + "WHERE m.user_id = :u AND m.tenant_id = :t AND m.branch_id IS NULL "
                        + "AND m.status = 'ACTIVE' AND t.status IN ('ACTIVE','TRIAL')")
                .param("u", UuidBytes.toBytes(userId))
                .param("t", UuidBytes.toBytes(tenantId))
                .query(String.class)
                .list());
        if (roles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado.");
        }
        return new TenantContext(userId, tenantId, roles);
    }
}