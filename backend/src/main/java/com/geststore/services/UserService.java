package com.geststore.services;

import com.geststore.exceptions.BusinessLogicException;
import com.geststore.exceptions.ResourceNotFoundException;
import com.geststore.models.dtos.UserRequestDto;
import com.geststore.models.dtos.UserProfileUpdateDto;
import com.geststore.models.dtos.UserResponseDto;
import com.geststore.models.entities.User;
import com.geststore.models.entities.Role;
import com.geststore.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lógica de negocio para usuarios
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
    public UserResponseDto getUserById(String id) {
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
     */
    public UserResponseDto createUser(UserRequestDto requestDto) {
        log.info("Creando nuevo usuario con email: {}", requestDto.getEmail());

        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessLogicException(
                    "El email ya está registrado: " + requestDto.getEmail(),
                    "DUPLICATE_EMAIL"
            );
        }

        if (requestDto.getRole() == null) {
            throw new BusinessLogicException(
                    "El rol de usuario es obligatorio",
                    "INVALID_ROLE"
            );
        }

        User user = User.builder()
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role(requestDto.getRole())
                .phone(requestDto.getPhone())
                .department(requestDto.getDepartment())
                .active(true)
                .build();

        user.onCreate();
        User savedUser = userRepository.save(user);
        log.info("Usuario creado exitosamente con ID: {}", savedUser.getId());

        return convertToDto(savedUser);
    }

    /**
     * Actualiza un usuario
     */
    public UserResponseDto updateUser(String id, UserRequestDto requestDto) {
        log.info("Actualizando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (!user.getEmail().equals(requestDto.getEmail()) &&
                userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessLogicException(
                    "El email ya está registrado: " + requestDto.getEmail(),
                    "DUPLICATE_EMAIL"
            );
        }

        user.setName(requestDto.getName());
        user.setLastName(requestDto.getLastName());
        user.setEmail(requestDto.getEmail());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
        user.setRole(requestDto.getRole() != null ? requestDto.getRole() : user.getRole());
        user.setPhone(requestDto.getPhone());
        user.setAddress(requestDto.getAddress());
        user.setDepartment(requestDto.getDepartment());
        user.setAvatar(requestDto.getAvatar());
        if (requestDto.getActive() != null) {
            user.setActive(requestDto.getActive());
        }
        user.onUpdate();

        User updatedUser = userRepository.save(user);
        log.info("Usuario actualizado exitosamente con ID: {}", id);

        return convertToDto(updatedUser);
    }

    /**
     * Actualiza el perfil del propio usuario.
     */
    public UserResponseDto updateProfile(String id, UserProfileUpdateDto requestDto) {
        log.info("Actualizando perfil del usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (requestDto.getEmail() != null && !requestDto.getEmail().isBlank()) {
            if (!user.getEmail().equals(requestDto.getEmail()) && userRepository.existsByEmail(requestDto.getEmail())) {
                throw new BusinessLogicException(
                        "El email ya está registrado: " + requestDto.getEmail(),
                        "DUPLICATE_EMAIL"
                );
            }
            user.setEmail(requestDto.getEmail());
        }

        if (requestDto.getName() != null) {
            user.setName(requestDto.getName());
        }
        if (requestDto.getLastName() != null) {
            user.setLastName(requestDto.getLastName());
        }
        if (requestDto.getPhone() != null) {
            user.setPhone(requestDto.getPhone());
        }
        if (requestDto.getAddress() != null) {
            user.setAddress(requestDto.getAddress());
        }
        if (requestDto.getAvatar() != null) {
            user.setAvatar(requestDto.getAvatar());
        }

        user.onUpdate();
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    /**
     * Actualiza el avatar del propio usuario a partir de un archivo (multipart/form-data).
     * Se persiste como Data URL base64 en el campo "avatar".
     */
    public UserResponseDto updateAvatarFromFile(String id, MultipartFile file) {
        log.info("Actualizando avatar (multipart) del usuario con ID: {}", id);

        if (file == null || file.isEmpty()) {
            throw new BusinessLogicException("El archivo de avatar es obligatorio", "INVALID_FILE");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new BusinessLogicException("No se pudo determinar el tipo de archivo", "INVALID_FILE_TYPE");
        }

        boolean allowed = contentType.equals("image/png")
                || contentType.equals("image/jpeg")
                || contentType.equals("image/svg+xml")
                || contentType.equals("image/webp");

        if (!allowed) {
            throw new BusinessLogicException(
                    "Formato no soportado. Usa PNG, JPG, SVG o WEBP",
                    "INVALID_FILE_TYPE"
            );
        }

        long maxBytes = 2L * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new BusinessLogicException("La imagen es demasiado grande (máx 2MB)", "FILE_TOO_LARGE");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + contentType + ";base64," + base64;

            user.setAvatar(dataUrl);
            user.onUpdate();
            User updatedUser = userRepository.save(user);
            return convertToDto(updatedUser);
        } catch (IOException e) {
            throw new BusinessLogicException("No se pudo leer el archivo de avatar", "FILE_READ_ERROR");
        }
    }

    /**
     * Actualiza la contraseña del propio usuario.
     */
    public void updatePassword(String id, String currentPassword, String newPassword) {
        log.info("Actualizando contraseña del usuario con ID: {}", id);

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new BusinessLogicException("La contraseña actual es obligatoria", "INVALID_PASSWORD");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new BusinessLogicException("La nueva contraseña es obligatoria", "INVALID_PASSWORD");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessLogicException("La contraseña actual no es correcta", "INVALID_CREDENTIALS");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.onUpdate();
        userRepository.save(user);
    }

    /**
     * Desactiva un usuario (soft delete)
     */
    public UserResponseDto deactivateUser(String id) {
        log.info("Desactivando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        user.setActive(false);
        user.onUpdate();
        User updatedUser = userRepository.save(user);
        log.info("Usuario desactivado exitosamente con ID: {}", id);

        return convertToDto(updatedUser);
    }

    /**
     * Activa un usuario previamente desactivado
     */
    public UserResponseDto activateUser(String id) {
        log.info("Activando usuario con ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        user.setActive(true);
        user.onUpdate();
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
