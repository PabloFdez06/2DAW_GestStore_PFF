package com.geststore.models.dtos;

import com.geststore.models.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para responder información de un usuario
 * No incluye la contraseña por seguridad
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private String id;
    private String name;
    private String lastName;
    private String email;
    private Role role;
    private String phone;
    private String address;
    private String department;
    private String avatar;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
