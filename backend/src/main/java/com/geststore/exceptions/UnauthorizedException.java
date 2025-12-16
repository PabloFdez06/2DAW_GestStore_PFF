package com.geststore.exceptions;

/**
 * Excepción lanzada cuando el usuario no tiene permiso para acceder a un recurso
 */
public class UnauthorizedException extends GestStoreException {

    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }

    public UnauthorizedException() {
        super("No tienes permiso para realizar esta acción", "UNAUTHORIZED");
    }
}
