package com.geststore.exceptions;

/**
 * Excepción lanzada cuando un recurso no es encontrado
 */
public class ResourceNotFoundException extends GestStoreException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrado con %s: '%s'", resourceName, fieldName, fieldValue),
                "RESOURCE_NOT_FOUND");
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s no encontrado con ID: %d", resourceName, id),
                "RESOURCE_NOT_FOUND");
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}
