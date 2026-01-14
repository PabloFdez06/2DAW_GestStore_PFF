package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.*;
import com.geststore.models.entities.Role;
import com.geststore.models.entities.User;
import com.geststore.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de autenticación
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registra un nuevo usuario
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registrando nuevo usuario con email: {}", request.getEmail());

        // Verificar si el email ya existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessLogicException(
                    "El email ya está registrado",
                    "EMAIL_ALREADY_EXISTS"
            );
        }

        // Crear nuevo usuario
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .department(request.getDepartment())
                .role(Role.WORKER) // Por defecto todos son WORKER
                .active(true)
                .build();

        user.onCreate();
        User savedUser = userRepository.save(user);
        
        log.info("Usuario registrado exitosamente: {}", savedUser.getEmail());

        // Generar token simple (en producción usar JWT)
        String token = generateSimpleToken(savedUser);

        return new AuthResponse(token, convertUserToDto(savedUser));
    }

    /**
     * Autentica un usuario
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Intentando login para: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", request.getEmail()));

        if (!user.getActive()) {
            throw new BusinessLogicException(
                    "El usuario está inactivo",
                    "USER_INACTIVE"
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessLogicException(
                    "Credenciales inválidas",
                    "INVALID_CREDENTIALS"
            );
        }

        log.info("Login exitoso para: {}", user.getEmail());

        // Generar token
        String token = generateSimpleToken(user);

        return new AuthResponse(token, convertUserToDto(user));
    }

    /**
     * Genera un token simple (en producción usar JWT real)
     */
    private String generateSimpleToken(User user) {
        return UUID.randomUUID().toString() + "_" + user.getId();
    }

    /**
     * Convierte User a UserResponseDto
     */
    private UserResponseDto convertUserToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .address(user.getAddress())
                .department(user.getDepartment())
                .avatar(user.getAvatar())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
