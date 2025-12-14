package com.geststore.controllers;

import com.geststore.models.dtos.LoginRequestDto;
import com.geststore.models.dtos.LoginResponseDto;
import com.geststore.services.AuthService;
import com.geststore.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación
 * Endpoints: /api/auth
 * Maneja login, refresh y logout
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login - Autenticar usuario
     * Recibe credenciales y devuelve token JWT
     * Acceso: Público
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequestDto) {
        log.info("POST /api/auth/login - Login para usuario: {}", loginRequestDto.getEmail());
        LoginResponseDto loginResponse = authService.login(loginRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Usuario autenticado correctamente", loginResponse));
    }

    /**
     * POST /api/auth/refresh - Refrescar token JWT
     * Devuelve un nuevo token con expiración renovada
     * Acceso: Autenticado
     */
    @PostMapping("/refresh")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoginResponseDto>> refreshToken() {
        log.info("POST /api/auth/refresh - Refrescando token");
        LoginResponseDto refreshResponse = authService.refreshToken();
        return ResponseEntity.ok(ApiResponse.success("Token refrescado correctamente", refreshResponse));
    }

    /**
     * POST /api/auth/logout - Cerrar sesión
     * Limpia el contexto de seguridad
     * Acceso: Autenticado
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("POST /api/auth/logout - Usuario cerrando sesión");
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Sesión cerrada correctamente", null));
    }
}
