package com.koaliado.tempo.shared.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class AccessTokenClaimsValidatorTest {

    private static Jwt jwt(String claim, String value, String tokenUse) {
        Jwt.Builder b = Jwt.withTokenValue("t").header("alg", "none").claim("sub", "u1")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60));
        if (claim != null) {
            b.claim(claim, value);
        }
        if (tokenUse != null) {
            b.claim("token_use", tokenUse);
        }
        return b.build();
    }

    private static boolean ok(AccessTokenClaimsValidator v, Jwt j) {
        return !v.validate(j).hasErrors();
    }

    @Test
    void cognitoAccessTokenOfExpectedClientIsAccepted() {
        var v = new AccessTokenClaimsValidator("app1", "client_id", "access");
        assertThat(ok(v, jwt("client_id", "app1", "access"))).isTrue();
    }

    @Test
    void cognitoIdTokenIsRejected() {
        var v = new AccessTokenClaimsValidator("app1", "client_id", "access");
        assertThat(ok(v, jwt("client_id", "app1", "id"))).isFalse();
    }

    @Test
    void tokenOfAnotherClientIsRejected() {
        var v = new AccessTokenClaimsValidator("app1", "client_id", "access");
        assertThat(ok(v, jwt("client_id", "otra-app", "access"))).isFalse();
    }

    @Test
    void keycloakTokenWithAzpAcceptedWhenTokenUseNotRequired() {
        var v = new AccessTokenClaimsValidator("app1", "azp", "none");
        assertThat(ok(v, jwt("azp", "app1", null))).isTrue();
    }

    @Test
    void keycloakConfigRejectsTokenWithoutAzpOrWithWrongAzp() {
        var v = new AccessTokenClaimsValidator("app1", "azp", "none");
        assertThat(ok(v, jwt("client_id", "app1", null))).isFalse();
        assertThat(ok(v, jwt("azp", "otra-app", null))).isFalse();
    }
}
