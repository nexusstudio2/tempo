package com.koaliado.tempo.shared.config;

import java.util.List;

import com.koaliado.tempo.shared.errors.ApiAccessDeniedHandler;
import com.koaliado.tempo.shared.errors.ApiAuthenticationEntryPoint;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {
    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http,
            @Value("${tempo.security.cognito-issuer:}") String issuer,
            @Value("${COGNITO_CLIENT_ID:}") String clientId,
            ObjectProvider<JwtDecoder> decoderProvider,
            ApiAuthenticationEntryPoint authenticationEntryPoint,
            ApiAccessDeniedHandler accessDeniedHandler) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll();
                    if (issuer == null || issuer.isBlank() || clientId == null || clientId.isBlank()) {
                        // Fail closed: health can start locally, but API routes stay unavailable until
                        // Cognito is configured.
                        authorize.anyRequest().denyAll();
                    } else {
                        authorize.anyRequest().authenticated();
                    }
                });

        if (issuer != null && !issuer.isBlank() && clientId != null && !clientId.isBlank()) {
            http.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                    .decoder(cognitoJwtDecoder(issuer, clientId))
                    .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler));
        }
        return http.build();
    }

    private JwtDecoder cognitoJwtDecoder(String issuer, String clientId) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(issuer.replaceAll("/+$", "") + "/.well-known/jwks.json").build();
        OAuth2TokenValidator<Jwt> cognitoClaims = jwt -> {
            boolean isAccessToken = "access".equals(jwt.getClaimAsString("token_use"));
            boolean isExpectedClient = clientId.equals(jwt.getClaimAsString("client_id"));
            return isAccessToken && isExpectedClient
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult
                            .failure(new OAuth2Error("invalid_token", "Invalid Cognito access token.", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuer), cognitoClaims));
        return decoder;
    }

    @Bean
    Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
        scopes.setAuthoritiesClaimName("scope");
        scopes.setAuthorityPrefix("SCOPE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var authorities = scopes.convert(jwt);
            return authorities == null ? List.of() : authorities;
        });
        return converter;
    }
}
