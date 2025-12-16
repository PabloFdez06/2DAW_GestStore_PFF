package com.geststore.exceptions;

/**
 * Excepción lanzada cuando la solicitud es inválida o viola reglas de negocio
 */
public class BusinessLogicException extends GestStoreException {

    public BusinessLogicException(String message) {
        super(message, "BUSINESS_LOGIC_ERROR");
    }

    public BusinessLogicException(String message, String errorCode) {
        super(message, errorCode);
    }

    public BusinessLogicException(String message, Throwable cause) {
        super(message, "BUSINESS_LOGIC_ERROR", cause);
    }
}
