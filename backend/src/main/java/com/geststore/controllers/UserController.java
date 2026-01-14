package com.geststore.controllers;

import com.geststore.models.dtos.UserRequestDto;
import com.geststore.models.dtos.UserProfileUpdateDto;
import com.geststore.models.dtos.UserResponseDto;
import com.geststore.models.dtos.UpdatePasswordRequest;
import com.geststore.services.UserService;
import com.geststore.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para operaciones con usuarios
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getMe(
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        log.info("GET /api/users/me - Obteniendo perfil del usuario");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("No se pudo identificar el usuario (X-User-Id)", null));
        }
        UserResponseDto user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("Perfil obtenido exitosamente", user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateMe(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody UserProfileUpdateDto requestDto
    ) {
        log.info("PUT /api/users/me - Actualizando perfil del usuario");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("No se pudo identificar el usuario (X-User-Id)", null));
        }
        UserResponseDto user = userService.updateProfile(userId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Perfil actualizado exitosamente", user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> updateMyPassword(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        log.info("PUT /api/users/me/password - Actualizando contraseña del usuario");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("No se pudo identificar el usuario (X-User-Id)", null));
        }
        userService.updatePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Contraseña actualizada exitosamente", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getAllUsers(Pageable pageable) {
        log.info("GET /api/users - Obteniendo todos los usuarios");
        Page<UserResponseDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Usuarios obtenidos exitosamente", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable String id) {
        log.info("GET /api/users/{} - Obteniendo usuario", id);
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Usuario obtenido exitosamente", user));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByEmail(@PathVariable String email) {
        log.info("GET /api/users/email/{} - Obteniendo usuario por email", email);
        UserResponseDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Usuario obtenido exitosamente", user));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> searchUsers(@RequestParam String q) {
        log.info("GET /api/users/search?q={} - Buscando usuarios", q);
        List<UserResponseDto> users = userService.searchUsersByName(q);
        return ResponseEntity.ok(ApiResponse.success("Búsqueda completada", users));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getUsersByRole(@PathVariable String role) {
        log.info("GET /api/users/role/{} - Obteniendo usuarios por rol", role);
        List<UserResponseDto> users = userService.getActiveUsersByRole(
                com.geststore.models.entities.Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.success("Usuarios obtenidos exitosamente", users));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(@Valid @RequestBody UserRequestDto requestDto) {
        log.info("POST /api/users - Creando nuevo usuario");
        UserResponseDto user = userService.createUser(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuario creado exitosamente", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserRequestDto requestDto) {
        log.info("PUT /api/users/{} - Actualizando usuario", id);
        UserResponseDto user = userService.updateUser(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Usuario actualizado exitosamente", user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> deactivateUser(@PathVariable String id) {
        log.info("DELETE /api/users/{} - Desactivando usuario", id);
        UserResponseDto user = userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Usuario desactivado exitosamente", user));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> activateUser(@PathVariable String id) {
        log.info("POST /api/users/{}/activate - Activando usuario", id);
        UserResponseDto user = userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("Usuario activado exitosamente", user));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserService.UserStatistics>> getUserStatistics() {
        log.info("GET /api/users/statistics - Obteniendo estadísticas");
        UserService.UserStatistics stats = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas", stats));
    }
}
