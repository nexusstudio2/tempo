package com.koaliado.tempo.shared.tenancy;

import java.util.List;
import java.util.Set;
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
     * Lista las membresias activas del usuario (por ahora solo a nivel de negocio).
     */
    public List<ContextView> listContexts(String cognitoSubject) {
        return jdbc.sql("SELECT m.id, t.name, m.role FROM tenant_memberships m "
                + "JOIN users u ON u.id = m.user_id JOIN tenants t ON t.id = m.tenant_id "
                + "WHERE u.cognito_subject = :sub AND u.status = 'ACTIVE' AND m.branch_id IS NULL "
                + "AND m.status = 'ACTIVE' AND t.status IN ('ACTIVE','TRIAL') ORDER BY t.name")
                .param("sub", cognitoSubject)
                .query((rs, i) -> new ContextView(UuidBytes.toUuid(rs.getBytes("id")), rs.getString("name"),
                        null, rs.getString("role"), List.of()))
                .list();
    }

    /**
     * Resuelve X-Context-Id (id de membresia). Nunca confia en el header: lo valida
     * contra la base.
     */
    public TenantContext resolve(String cognitoSubject, String contextHeader) {
        if (contextHeader == null || contextHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el header X-Context-Id.");
        }
        UUID contextId;
        try {
            contextId = UUID.fromString(contextHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Context-Id invalido.");
        }
        return jdbc.sql("SELECT u.id AS user_id, m.tenant_id, m.role FROM tenant_memberships m "
                + "JOIN users u ON u.id = m.user_id JOIN tenants t ON t.id = m.tenant_id "
                + "WHERE m.id = :mid AND u.cognito_subject = :sub AND u.status = 'ACTIVE' "
                + "AND m.branch_id IS NULL AND m.status = 'ACTIVE' AND t.status IN ('ACTIVE','TRIAL')")
                .param("mid", UuidBytes.toBytes(contextId))
                .param("sub", cognitoSubject)
                .query((rs, i) -> new TenantContext(UuidBytes.toUuid(rs.getBytes("user_id")),
                        UuidBytes.toUuid(rs.getBytes("tenant_id")), Set.of(rs.getString("role"))))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado."));
    }
}