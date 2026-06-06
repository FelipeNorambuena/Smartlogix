package com.smartlogix.api_gateway.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/*
 * Pruebas unitarias de la configuracion JWT del Gateway.
 * Verifican que la misma clave compartida valide tokens emitidos por auth-service.
 */
class JwtConfigTest {

    private final JwtConfig jwtConfig = new JwtConfig();

    @Test
    void jwtSecretKeyRejectsShortSecrets() {
        assertThatThrownBy(() -> jwtConfig.jwtSecretKey("short-secret"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("al menos 32 bytes");
    }

    @Test
    void jwtDecoderAcceptsTokenWithConfiguredIssuer() {
        String secret = "smartlogix-auth-test-secret-12345678901234567890";
        SecretKey key = jwtConfig.jwtSecretKey(secret);
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        JwtDecoder decoder = jwtConfig.jwtDecoder(key, "smartlogix-auth-test");
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("smartlogix-auth-test")
                .subject("admin@smartlogix.com")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(1800))
                .claim("roles", java.util.List.of("ADMIN"))
                .build();

        String token = encoder.encode(JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(),
                        claims))
                .getTokenValue();
        Jwt decoded = decoder.decode(token);

        assertThat(decoded.getClaimAsString("iss")).isEqualTo("smartlogix-auth-test");
        assertThat(decoded.getSubject()).isEqualTo("admin@smartlogix.com");
        assertThat(decoded.getClaimAsStringList("roles")).containsExactly("ADMIN");
    }
}
