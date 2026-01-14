package com.geststore.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Entidad User - Representa los usuarios del sistema
 * Almacena información de trabajadores, gestores y administradores.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;

    private String phone;

    private String address;

    private String department;

    /**
     * Avatar del usuario.
     * Se almacena como DataURL (base64) o URL.
     */
    private String avatar;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Métodos de ciclo de vida
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
