package com.geststore.exceptions;

/**
 * Excepción base para todas las excepciones de negocio
 */
public class GestStoreException extends RuntimeException {

    private final String errorCode;

    public GestStoreException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }

    public GestStoreException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public GestStoreException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "INTERNAL_ERROR";
    }

    public GestStoreException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
