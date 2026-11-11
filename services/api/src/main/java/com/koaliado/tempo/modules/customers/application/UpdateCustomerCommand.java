package com.koaliado.tempo.modules.customers.application;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** PATCH parcial: un campo null (o texto en blanco) significa "sin cambio". */
public record UpdateCustomerCommand(
        @Pattern(regexp = ".*\\S.*") @Size(max = 160) String fullName,
        @Email @Size(max = 254) String email,
        @Size(max = 32) String phone,
        @PastOrPresent LocalDate dateOfBirth,
        UUID branchId,
        @Size(max = 160) String emergencyContactName,
        @Size(max = 32) String emergencyContactPhone,
        @Size(max = 60) String emergencyContactRelationship,
        String notes) {

    public List<String> changedFields() {
        List<String> f = new ArrayList<>();
        if (present(fullName))
            f.add("fullName");
        if (present(email))
            f.add("email");
        if (present(phone))
            f.add("phone");
        if (dateOfBirth != null)
            f.add("dateOfBirth");
        if (branchId != null)
            f.add("branchId");
        if (present(emergencyContactName))
            f.add("emergencyContactName");
        if (present(emergencyContactPhone))
            f.add("emergencyContactPhone");
        if (present(emergencyContactRelationship))
            f.add("emergencyContactRelationship");
        if (present(notes))
            f.add("notes");
        return f;
    }

    private static boolean present(String s) {
        return s != null && !s.isBlank();
    }
}