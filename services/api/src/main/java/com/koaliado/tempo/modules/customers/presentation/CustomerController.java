package com.koaliado.tempo.modules.customers.presentation;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import com.koaliado.tempo.modules.customers.application.CreateCustomerCommand;
import com.koaliado.tempo.modules.customers.application.CustomerService;
import com.koaliado.tempo.modules.customers.application.CustomerView;
import com.koaliado.tempo.shared.tenancy.TenantAccessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import com.koaliado.tempo.modules.customers.application.UpdateCustomerCommand;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private static final String TENANT_HEADER = "X-Context-Id";

    private final TenantAccessService access;
    private final CustomerService service;

    public CustomerController(TenantAccessService access, CustomerService service) {
        this.access = access;
        this.service = service;
    }

    @GetMapping
    List<CustomerView> list(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = TENANT_HEADER, required = false) String tenant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return service.list(access.resolve(jwt.getSubject(), tenant), page, size);
    }

    @GetMapping("/{id}")
    CustomerView get(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = TENANT_HEADER, required = false) String tenant,
            @PathVariable UUID id) {
        return service.get(access.resolve(jwt.getSubject(), tenant), id);
    }

    @PostMapping
    ResponseEntity<CustomerView> create(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = TENANT_HEADER, required = false) String tenant,
            @Valid @RequestBody CreateCustomerCommand command) {
        CustomerView created = service.create(access.resolve(jwt.getSubject(), tenant), command);
        return ResponseEntity.created(URI.create("/api/v1/customers/" + created.id())).body(created);
    }

    @PatchMapping("/{id}")
    CustomerView update(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = TENANT_HEADER, required = false) String tenant,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomerCommand command) {
        return service.update(access.resolve(jwt.getSubject(), tenant), id, command);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deactivate(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = TENANT_HEADER, required = false) String tenant,
            @PathVariable UUID id) {
        service.deactivate(access.resolve(jwt.getSubject(), tenant), id);
        return ResponseEntity.noContent().build();
    }
}