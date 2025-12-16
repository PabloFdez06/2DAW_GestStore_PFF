package com.geststore.repositories;

import com.geststore.models.entities.User;
import com.geststore.models.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad User
 * Proporciona métodos CRUD y consultas personalizadas para usuarios
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca un usuario por email
     * @param email email del usuario
     * @return Optional con el usuario si existe
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca todos los usuarios con un rol específico
     * @param role el rol a filtrar
     * @return lista de usuarios con ese rol
     */
    List<User> findByRole(Role role);

    /**
     * Busca todos los usuarios activos
     * @return lista de usuarios activos
     */
    List<User> findByActive(Boolean active);

    /**
     * Busca usuarios por departamento
     * @param department el departamento
     * @return lista de usuarios del departamento
     */
    List<User> findByDepartment(String department);

    /**
     * Busca usuarios activos con un rol específico
     * @param role el rol
     * @param active estado activo
     * @return lista de usuarios que cumplen ambos criterios
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = :active ORDER BY u.name")
    List<User> findActiveUsersByRole(@Param("role") Role role, @Param("active") Boolean active);

    /**
     * Busca usuarios cuyo nombre contiene el texto buscado
     * @param searchText texto de búsqueda
     * @return lista de usuarios cuyo nombre contiene el texto
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :searchText, '%')) ORDER BY u.name")
    List<User> searchByName(@Param("searchText") String searchText);

    /**
     * Cuenta el número de usuarios con un rol específico
     * @param role el rol
     * @return número de usuarios con ese rol
     */
    Long countByRole(Role role);

    /**
     * Verifica si existe un usuario con el email especificado
     * @param email email a verificar
     * @return true si existe, false si no
     */
    Boolean existsByEmail(String email);
}
