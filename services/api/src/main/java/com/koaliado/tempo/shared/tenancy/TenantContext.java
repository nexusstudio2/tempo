package com.koaliado.tempo.shared.tenancy;

import java.util.Set;
import java.util.UUID;

public record TenantContext(UUID userId, UUID tenantId, Set<String> roles) {
    public boolean hasAnyRole(String... allowed) {
        for (String r : allowed) {
            if (roles.contains(r)) {
                return true;
            }
        }
        return false;
    }
}