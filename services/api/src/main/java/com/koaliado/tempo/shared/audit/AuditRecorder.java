package com.koaliado.tempo.shared.audit;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.koaliado.tempo.shared.tenancy.UuidBytes;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class AuditRecorder {
    private final JdbcClient jdbc;

    public AuditRecorder(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Registra solo nombres de campos, nunca valores. Se une a la transaccion en curso. */
    public void record(UUID tenantId, UUID actorUserId, String action, String resourceType,
                       UUID resourceId, List<String> fields) {
        String details = "{\"fields\":[" + fields.stream()
            .map(f -> "\"" + f + "\"").collect(Collectors.joining(",")) + "]}";
        jdbc.sql("INSERT INTO audit_events (id, tenant_id, actor_user_id, action, resource_type, resource_id, "
                + "details_json, correlation_id) VALUES (:id, :t, :a, :action, :rt, :rid, :details, :cid)")
            .param("id", UuidBytes.toBytes(UUID.randomUUID()))
            .param("t", UuidBytes.toBytes(tenantId))
            .param("a", UuidBytes.toBytes(actorUserId))
            .param("action", action)
            .param("rt", resourceType)
            .param("rid", UuidBytes.toBytes(resourceId))
            .param("details", details)
            .param("cid", correlationId())
            .update();
    }

    private static String correlationId() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs
            && attrs.getRequest().getAttribute("tempo.correlationId") instanceof String id) {
            return id;
        }
        return UUID.randomUUID().toString();
    }
}
