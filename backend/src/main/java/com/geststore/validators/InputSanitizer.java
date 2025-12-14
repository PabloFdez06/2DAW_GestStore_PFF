package com.geststore.validators;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Sanitizador de entrada
 * Limpia datos de entrada para evitar inyecciones XSS
 */
@Slf4j
@Component
public class InputSanitizer {

    /**
     * Sanitiza una cadena de entrada
     * Reemplaza caracteres especiales HTML con sus entidades
     */
    public String sanitize(String input) {
        if (input == null) {
            return null;
        }

        return input.trim()
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;")
                .replaceAll("'", "&#39;")
                .replaceAll("&", "&amp;");
    }

    /**
     * Valida si una cadena contiene caracteres peligrosos
     */
    public boolean isSafe(String input) {
        if (input == null) {
            return true;
        }

        return !input.matches(".*[<>\"'%;()&+].*");
    }
}
