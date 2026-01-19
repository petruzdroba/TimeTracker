package com.pz.backend.service;

import com.pz.backend.entity.UserAuth;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret:SUPER_SECRET_KEY}")
    private String secret;

    @Value("${jwt.expiration:3600000}") // default 1 hour
    private long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // default  7 days
    private long refreshExpiration;

    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserAuth user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("user_id", user.getUserData().getId())
                .claim("role", user.getUserData().getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UserAuth user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("user_id", user.getUserData().getId())
                .claim("token_type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("user_id", Long.class);
    }

    public String getRoleFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }

}
