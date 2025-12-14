package com.geststore.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador de acceso denegado
 * Se dispara cuando un usuario autenticado intenta acceder a un recurso sin permisos suficientes
 */
@Slf4j
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest httpServletRequest,
                      HttpServletResponse httpServletResponse,
                      AccessDeniedException e) throws IOException, ServletException {

        log.error("Acceso denegado para ruta: {} - Razón: {}", 
                  httpServletRequest.getServletPath(), e.getMessage());

        httpServletResponse.setContentType("application/json;charset=UTF-8");
        httpServletResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Acceso denegado");
        body.put("message", "No tiene permisos suficientes para acceder a este recurso. Verifique su rol de usuario.");
        body.put("path", httpServletRequest.getServletPath());

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(httpServletResponse.getOutputStream(), body);
    }
}
