package com.koaliado.tempo.shared.errors;

import java.util.List;

public record ApiErrorResponse(String code, String message, List<FieldErrorResponse> details, String correlationId) {
}
