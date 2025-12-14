package com.geststore.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Proveedor de JWT - Genera, valida y parsea tokens JWT
 * Utiliza JJWT para crear tokens con firma HS512
 */
@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret:mySecretKeyForGeneratingJWTTokensWithMinimumLengthOfThirtyTwoCharactersOrMore}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}")
    private long jwtExpirationMs;

    /**
     * Genera un token JWT a partir de la autenticación
     */
    public String generateTokenFromAuth(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername());
    }

    /**
     * Genera un token JWT a partir del nombre de usuario
     */
    public String generateToken(String username) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Obtiene el nombre de usuario (email) del token JWT
     */
    public String getUsernameFromJwt(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extrayendo username del JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Valida si un token JWT es válido
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene los claims del token
     */
    public Claims getClaimsFromJwt(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Error getting claims from JWT: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Obtiene el tiempo de expiración del token
     */
    public long getExpirationTime() {
        return jwtExpirationMs;
    }
}
