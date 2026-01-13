package com.geststore.controllers;

import com.geststore.models.dtos.UserRequestDto;
import com.geststore.models.dtos.UserResponseDto;
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
