package com.koaliado.tempo.modules.customers.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerView(UUID id, UUID branchId, String fullName, String email, String phone,
        LocalDate dateOfBirth, String emergencyContactName, String emergencyContactPhone,
        String emergencyContactRelationship, String status, String notes, Instant createdAt) {
}