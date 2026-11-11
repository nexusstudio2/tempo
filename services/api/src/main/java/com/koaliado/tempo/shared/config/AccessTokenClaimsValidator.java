package com.koaliado.tempo.shared.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/** Valida de que cliente es el token y, si se pide, su tipo. Cognito: client_id + token_use=access. Keycloak: azp. */
public class AccessTokenClaimsValidator implements OAuth2TokenValidator<Jwt> {
    private final String clientId;
    private final String clientIdClaim;
    private final String requiredTokenUse;

    public AccessTokenClaimsValidator(String clientId, String clientIdClaim, String requiredTokenUse) {
        this.clientId = clientId;
        this.clientIdClaim = clientIdClaim;
        this.requiredTokenUse = requiredTokenUse;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        boolean tokenUseRequired = requiredTokenUse != null && !requiredTokenUse.isBlank()
                && !"none".equalsIgnoreCase(requiredTokenUse.trim());
        boolean tokenUseOk = !tokenUseRequired || requiredTokenUse.trim().equals(jwt.getClaimAsString("token_use"));
        boolean clientOk = clientId != null && clientId.equals(jwt.getClaimAsString(clientIdClaim));
        return tokenUseOk && clientOk
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Invalid access token.", null));
    }
}