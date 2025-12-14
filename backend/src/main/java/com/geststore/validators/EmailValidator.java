package com.geststore.validators;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Validador personalizado para email
 * Valida formato de email usando regex
 */
@Slf4j
@Component
public class EmailValidator {

    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})$");

    /**
     * Valida si un email tiene formato correcto
     */
    public boolean isValid(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        boolean isValid = EMAIL_PATTERN.matcher(email).matches();
        if (!isValid) {
            log.warn("Email inválido: {}", email);
        }
        return isValid;
    }

    /**
     * Valida y devuelve el email en minúsculas normalizado
     */
    public String normalize(String email) {
        if (email == null) {
            return null;
        }
        String normalized = email.trim().toLowerCase();
        if (!isValid(normalized)) {
            throw new IllegalArgumentException("Email inválido: " + email);
        }
        return normalized;
    }
}
