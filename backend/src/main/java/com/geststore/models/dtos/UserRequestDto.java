package com.geststore.models.dtos;

import com.geststore.models.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para crear/actualizar un usuario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {
    private String name;
    private String email;
    private String password;
    private Role role;
    private String phone;
    private String department;
    private Boolean active;
}
