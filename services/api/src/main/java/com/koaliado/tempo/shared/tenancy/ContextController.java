package com.koaliado.tempo.shared.tenancy;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contexts")
public class ContextController {
    private final TenantAccessService access;

    public ContextController(TenantAccessService access) {
        this.access = access;
    }

    @GetMapping
    List<ContextView> list(@AuthenticationPrincipal Jwt jwt) {
        return access.listContexts(jwt.getSubject());
    }
}