package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.UserRequestDto;
import com.geststore.models.dtos.UserResponseDto;
import com.geststore.models.entities.User;
import com.geststore.models.entities.Role;
import com.geststore.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para usuarios
 * Maneja operaciones CRUD y validaciones
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtiene todos los usuarios
     */
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        log.info("Obteniendo todos los usuarios, página: {}", pageable.getPageNumber());
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToDto);
    }

    /**
     * Obtiene un usuario por ID
     */
    public UserResponseDto getUserById(Long id) {
        log.info("Buscando usuario con ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        return convertToDto(user);
    }

    /**
     * Obtiene un usuario por email
     */
    public UserResponseDto getUserByEmail(String email) {
        log.info("Buscando usuario con email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
        return convertToDto(user);
    }

    /**
     * Busca usuarios activos por rol
     */
    public List<UserResponseDto> getActiveUsersByRole(Role role) {
        log.info("Obteniendo usuarios activos con rol: {}", role);
        List<User> users = userRepository.findActiveUsersByRole(role, true);
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuarios por departamento
     */
    public List<UserResponseDto> getUsersByDepartment(String department) {
        log.info("Obteniendo usuarios del departamento: {}", department);
        List<User> users = userRepository.findByDepartment(department);
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuarios por nombre
     */
    public List<UserResponseDto> searchUsersByName(String searchText) {
        log.info("Buscando usuarios con nombre: {}", searchText);
        List<User> users = userRepository.searchByName(searchText);
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo usuario
     * LÓGICA DE NEGOCIO:
     * - El email debe ser único
     * - La contraseña se debe hashear
     * - Por defecto el usuario es activo
     */
    public UserResponseDto createUser(UserRequestDto requestDto) {
        log.info("Creando nuevo usuario con email: {}", requestDto.getEmail());

        // Validar que el email sea único
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessLogicException(
                    "El email ya está registrado: " + requestDto.getEmail(),
                    "DUPLICATE_EMAIL"
            );
        }

        // Validar que tenga rol
        if (requestDto.getRole() == null) {
            throw new BusinessLogicException(
                    "El rol de usuario es obligatorio",
                    "INVALID_ROLE"
            );
        }

        // Crear usuario
        User user = User.builder()
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role(requestDto.getRole())
                .phone(requestDto.getPhone())
                .department(requestDto.getDepartment())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Usuario creado exitosamente con ID: {}", savedUser.getId());

        return convertToDto(savedUser);
    }

    /**
     * Actualiza un usuario
     * LÓGICA DE NEGOCIO:
     * - No se puede cambiar el email si ya existe otro usuario con ese email
     * - Si se actualiza la contraseña, se debe hashear
     */
    public UserResponseDto updateUser(Long id, UserRequestDto requestDto) {
        log.info("Actualizando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        // Si cambia el email, validar que sea único
        if (!user.getEmail().equals(requestDto.getEmail()) &&
                userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessLogicException(
                    "El email ya está registrado: " + requestDto.getEmail(),
                    "DUPLICATE_EMAIL"
            );
        }

        // Actualizar campos
        user.setName(requestDto.getName());
        user.setEmail(requestDto.getEmail());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
        user.setRole(requestDto.getRole() != null ? requestDto.getRole() : user.getRole());
        user.setPhone(requestDto.getPhone());
        user.setDepartment(requestDto.getDepartment());
        if (requestDto.getActive() != null) {
            user.setActive(requestDto.getActive());
        }

        User updatedUser = userRepository.save(user);
        log.info("Usuario actualizado exitosamente con ID: {}", id);

        return convertToDto(updatedUser);
    }

    /**
     * Desactiva un usuario (soft delete)
     * LÓGICA DE NEGOCIO:
     * - El usuario debe existir
     * - Se marca como inactivo en lugar de eliminar
     */
    public UserResponseDto deactivateUser(Long id) {
        log.info("Desactivando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        // Si el usuario tiene tareas activas, no se puede desactivar
        long activeTasks = user.getAssignedTasks().stream()
                .filter(task -> task.getStatus().name().equals("IN_PROGRESS") ||
                                task.getStatus().name().equals("PENDING"))
                .count();

        if (activeTasks > 0) {
            throw new BusinessLogicException(
                    "No se puede desactivar un usuario con " + activeTasks + " tarea(s) activa(s)",
                    "USER_HAS_ACTIVE_TASKS"
            );
        }

        user.setActive(false);
        User updatedUser = userRepository.save(user);
        log.info("Usuario desactivado exitosamente con ID: {}", id);

        return convertToDto(updatedUser);
    }

    /**
     * Activa un usuario previamente desactivado
     */
    public UserResponseDto activateUser(Long id) {
        log.info("Activando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        user.setActive(true);
        User updatedUser = userRepository.save(user);
        log.info("Usuario activado exitosamente con ID: {}", id);

        return convertToDto(updatedUser);
    }

    /**
     * Valida las credenciales de un usuario
     */
    @Transactional(readOnly = true)
    public UserResponseDto validateCredentials(String email, String password) {
        log.info("Validando credenciales para email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));

        if (!user.getActive()) {
            throw new BusinessLogicException(
                    "La cuenta de usuario está desactivada",
                    "USER_INACTIVE"
            );
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessLogicException(
                    "Las credenciales proporcionadas son inválidas",
                    "INVALID_CREDENTIALS"
            );
        }

        log.info("Credenciales validadas exitosamente para usuario con ID: {}", user.getId());
        return convertToDto(user);
    }

    /**
     * Obtiene estadísticas de usuarios
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        log.info("Obteniendo estadísticas de usuarios");

        long totalUsers = userRepository.count();
        long adminCount = userRepository.countByRole(Role.ADMIN);
        long managerCount = userRepository.countByRole(Role.MANAGER);
        long workerCount = userRepository.countByRole(Role.WORKER);
        long activeUsers = userRepository.findByActive(true).size();

        return UserStatistics.builder()
                .totalUsers(totalUsers)
                .adminCount(adminCount)
                .managerCount(managerCount)
                .workerCount(workerCount)
                .activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .build();
    }

    /**
     * Convierte una entidad User a UserResponseDto
     */
    private UserResponseDto convertToDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * DTO para estadísticas de usuarios
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class UserStatistics {
        private long totalUsers;
        private long adminCount;
        private long managerCount;
        private long workerCount;
        private long activeUsers;
        private long inactiveUsers;
    }
}
