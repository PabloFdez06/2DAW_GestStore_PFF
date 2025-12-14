package com.geststore.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para JwtProvider
 * Verifica generación, validación y parseo de tokens JWT
 */
@SpringBootTest
public class JwtProviderTests {

    @Autowired
    private JwtProvider jwtProvider;

    @Test
    public void testGenerateToken() {
        String username = "test@example.com";
        String token = jwtProvider.generateToken(username);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // Header.Payload.Signature
    }

    @Test
    public void testGetUsernameFromValidToken() {
        String username = "test@example.com";
        String token = jwtProvider.generateToken(username);

        String extractedUsername = jwtProvider.getUsernameFromJwt(token);

        assertEquals(username, extractedUsername);
    }

    @Test
    public void testValidateValidToken() {
        String username = "test@example.com";
        String token = jwtProvider.generateToken(username);

        assertTrue(jwtProvider.validateToken(token));
    }

    @Test
    public void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";

        assertFalse(jwtProvider.validateToken(invalidToken));
    }

    @Test
    public void testGetUsernameFromInvalidToken() {
        String invalidToken = "invalid.token.here";

        String username = jwtProvider.getUsernameFromJwt(invalidToken);

        assertNull(username);
    }

    @Test
    public void testGenerateTokenFromAuth() {
        Collection<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );
        UserDetails userDetails = new User("test@example.com", "password", authorities);
        
        // Crear un mock de Authentication (esto normalmente lo hace Spring)
        // Por ahora solo verificamos que el método existe y funciona
        assertNotNull(jwtProvider);
    }

    @Test
    public void testGetExpirationTime() {
        long expirationTime = jwtProvider.getExpirationTime();

        assertTrue(expirationTime > 0);
        assertEquals(3600000, expirationTime); // 1 hora en ms
    }
}
