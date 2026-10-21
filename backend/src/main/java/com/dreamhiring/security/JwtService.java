package com.dreamhiring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] secret = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("JWT secret must contain at least 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret);
    }

    public String createToken(SecurityPrincipal principal) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.getExpirationSeconds());
        return Jwts.builder()
                .subject(String.valueOf(principal.id()))
                .claim("username", principal.username())
                .claim("role", principal.role().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public JwtClaims parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new JwtClaims(
                Long.valueOf(claims.getSubject()),
                claims.get("username", String.class),
                UserRole.fromCode(claims.get("role", String.class))
        );
    }

    public long getExpirationSeconds() {
        return properties.getExpirationSeconds();
    }

    public record JwtClaims(Long userId, String username, UserRole role) {
    }
}
