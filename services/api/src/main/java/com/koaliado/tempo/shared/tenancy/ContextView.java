package com.koaliado.tempo.shared.tenancy;

import java.util.List;
import java.util.UUID;

public record ContextView(
        UUID id,
        String tenantName,
        String branchName,
        String role,
        List<String> permissions) {
}