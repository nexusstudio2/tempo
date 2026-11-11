package com.koaliado.tempo.modules.customers.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record CreateCustomerCommand(
        @NotBlank @Size(max = 160) String fullName,
        @Email @Size(max = 254) String email,
        @Size(max = 32) String phone,
        @PastOrPresent LocalDate dateOfBirth,
        UUID branchId,
        @Size(max = 160) String emergencyContactName,
        @Size(max = 32) String emergencyContactPhone,
        @Size(max = 60) String emergencyContactRelationship,
        String notes,
        @Valid Guardian guardian) {

    public record Guardian(
            @NotBlank @Size(max = 160) String fullName,
            @NotBlank @Size(max = 60) String relationship,
            @NotBlank @Size(max = 32) String phone,
            @Email @Size(max = 254) String email,
            @NotNull @PastOrPresent Instant consentGivenAt) {
    }
}