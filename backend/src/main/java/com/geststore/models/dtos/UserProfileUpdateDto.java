package com.geststore.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el perfil del usuario autenticado.
 * Evita exponer campos sensibles como role/active/password.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateDto {
    private String name;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String avatar;
}
