package com.koaliado.tempo.modules.customers.application;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.koaliado.tempo.modules.customers.infrastructure.CustomerRepository;
import com.koaliado.tempo.shared.audit.AuditRecorder;
import com.koaliado.tempo.shared.tenancy.TenantContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {
    private static final String[] READ_ROLES = { "BUSINESS_OWNER", "BUSINESS_ADMIN", "MANAGER", "RECEPTIONIST",
            "INSTRUCTOR" };
    private static final String[] WRITE_ROLES = { "BUSINESS_OWNER", "BUSINESS_ADMIN", "MANAGER", "RECEPTIONIST" };
    private static final String[] DEACTIVATE_ROLES = { "BUSINESS_OWNER", "BUSINESS_ADMIN", "MANAGER" };

    private final CustomerRepository repository;
    private final Clock clock;
    private final AuditRecorder audit;

    public CustomerService(CustomerRepository repository, Clock clock, AuditRecorder audit) {
        this.repository = repository;
        this.clock = clock;
        this.audit = audit;
    }

    public List<CustomerView> list(TenantContext ctx, int page, int size) {
        requireRole(ctx, READ_ROLES);
        int limit = Math.min(Math.max(size, 1), 100);
        return repository.findPage(ctx.tenantId(), limit, Math.max(page, 0) * limit);
    }

    public CustomerView get(TenantContext ctx, UUID id) {
        requireRole(ctx, READ_ROLES);
        return repository.findById(ctx.tenantId(), id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado."));
    }

    @Transactional
    public CustomerView create(TenantContext ctx, CreateCustomerCommand cmd) {
        requireRole(ctx, WRITE_ROLES);
        boolean hasName = cmd.emergencyContactName() != null && !cmd.emergencyContactName().isBlank();
        boolean hasPhone = cmd.emergencyContactPhone() != null && !cmd.emergencyContactPhone().isBlank();
        if (hasName != hasPhone) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El contacto de emergencia requiere nombre y telefono.");
        }
        if (isMinor(cmd.dateOfBirth()) && cmd.guardian() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Un menor de edad requiere tutor con consentimiento.");
        }
        UUID id = UUID.randomUUID();
        try {
            repository.insert(ctx.tenantId(), id, cmd);
            if (cmd.guardian() != null) {
                repository.insertGuardian(ctx.tenantId(), id, cmd.guardian(), ctx.userId());
            }
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese correo.");
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Datos invalidos (revisa la sucursal).");
        }
        return repository.findById(ctx.tenantId(), id).orElseThrow();
    }

    @Transactional
    public CustomerView update(TenantContext ctx, UUID id, UpdateCustomerCommand cmd) {
        requireRole(ctx, WRITE_ROLES);
        List<String> fields = cmd.changedFields();
        if (fields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay cambios que aplicar.");
        }
        repository.findById(ctx.tenantId(), id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado."));
        try {
            repository.update(ctx.tenantId(), id, cmd);
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un cliente con ese correo.");
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Datos invalidos (revisa sucursal y contacto de emergencia).");
        }
        CustomerView updated = repository.findById(ctx.tenantId(), id).orElseThrow();
        if (isMinor(updated.dateOfBirth()) && repository.activeGuardianCount(ctx.tenantId(), id) == 0) {
            // Lanzar aqui revierte la transaccion: el cambio no queda guardado.
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Un menor de edad requiere tutor con consentimiento.");
        }
        audit.record(ctx.tenantId(), ctx.userId(), "customer.update", "customer", id, fields);
        return updated;
    }

    @Transactional
    public void deactivate(TenantContext ctx, UUID id) {
        requireRole(ctx, DEACTIVATE_ROLES);
        CustomerView current = repository.findById(ctx.tenantId(), id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado."));
        if ("INACTIVE".equals(current.status())) {
            return;
        }
        repository.deactivate(ctx.tenantId(), id);
        audit.record(ctx.tenantId(), ctx.userId(), "customer.deactivate", "customer", id, List.of("status"));
    }

    private boolean isMinor(LocalDate dob) {
        return dob != null && dob.plusYears(18).isAfter(LocalDate.now(clock));
    }

    private static void requireRole(TenantContext ctx, String[] allowed) {
        if (!ctx.hasAnyRole(allowed)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado.");
        }
    }
}