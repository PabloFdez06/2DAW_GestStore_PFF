package com.geststore.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad User - Representa los usuarios del sistema
 * Almacena información de trabajadores, gestores y administradores.
 *
 * Relaciones:
 * - 1:N con Task (tareas asignadas)
 * - 1:N con Task (tareas creadas)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_role", columnList = "role")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String department;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Tareas asignadas a este usuario
     * Un usuario puede tener varias tareas asignadas
     */
    @OneToMany(mappedBy = "assignedUser", cascade = CascadeType.REFRESH)
    @Builder.Default
    private Set<Task> assignedTasks = new HashSet<>();

    /**
     * Tareas creadas por este usuario
     * Un usuario puede crear varias tareas
     */
    @OneToMany(mappedBy = "createdByUser", cascade = CascadeType.REFRESH)
    @Builder.Default
    private Set<Task> createdTasks = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
