package com.koaliado.tempo.shared.errors;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> invalidFields(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<FieldErrorResponse> details = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> new FieldErrorResponse(error.getField(), "invalid", "El valor no es válido."))
            .toList();
        return response(HttpStatus.BAD_REQUEST, "validation_failed", "Revisa los campos indicados.", details, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiErrorResponse> invalidBody(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "invalid_request", "El cuerpo de la solicitud no es válido.", List.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> unexpected(Exception exception, HttpServletRequest request) {
        String correlationId = correlationId(request);
        log.error("Unhandled API exception. correlationId={}", correlationId, exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiErrorResponse("internal_error", "Ocurrió un error interno.", List.of(), correlationId));
    }

    private ResponseEntity<ApiErrorResponse> response(HttpStatus status, String code, String message,
                                                       List<FieldErrorResponse> details, HttpServletRequest request) {
        String correlationId = correlationId(request);
        return ResponseEntity.status(status).body(new ApiErrorResponse(code, message, details, correlationId));
    }

    private String correlationId(HttpServletRequest request) {
        Object requestId = request.getAttribute("tempo.correlationId");
        return requestId instanceof String value ? value : UUID.randomUUID().toString();
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiErrorResponse> status(ResponseStatusException exception, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String code = switch (status) {
            case BAD_REQUEST -> "bad_request";
            case FORBIDDEN -> "forbidden";
            case NOT_FOUND -> "not_found";
            case CONFLICT -> "conflict";
            case UNPROCESSABLE_ENTITY -> "unprocessable_entity";
            default -> "error";
        };
        String message = exception.getReason() != null ? exception.getReason() : status.getReasonPhrase();
        return response(status, code, message, List.of(), request);
    }
}
