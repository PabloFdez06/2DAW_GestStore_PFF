package com.geststore.exceptions;

/**
 * Excepción lanzada cuando los datos proporcionados son inválidos
 */
public class ValidationException extends GestStoreException {

    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
    }

    public ValidationException(String message, String fieldName) {
        super(String.format("Error de validación en %s: %s", fieldName, message),
                "VALIDATION_ERROR");
    }
}
