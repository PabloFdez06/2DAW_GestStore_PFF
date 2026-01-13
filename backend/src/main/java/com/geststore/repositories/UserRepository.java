package com.geststore.repositories;

import com.geststore.models.entities.User;
import com.geststore.models.entities.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad User
 * Proporciona métodos CRUD y consultas personalizadas para usuarios
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Busca un usuario por email
     */
    Optional<User> findByEmail(String email);

    /**
     * Busca todos los usuarios con un rol específico
     */
    List<User> findByRole(Role role);

    /**
     * Busca todos los usuarios activos
     */
    List<User> findByActive(Boolean active);

    /**
     * Busca usuarios por departamento
     */
    List<User> findByDepartment(String department);

    /**
     * Busca usuarios activos con un rol específico
     */
    List<User> findByRoleAndActive(Role role, Boolean active);

    /**
     * Método helper para compatibilidad
     */
    default List<User> findActiveUsersByRole(Role role, Boolean active) {
        return findByRoleAndActive(role, active);
    }

    /**
     * Busca usuarios cuyo nombre contiene el texto buscado
     */
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<User> searchByName(String searchText);

    /**
     * Cuenta el número de usuarios con un rol específico
     */
    Long countByRole(Role role);

    /**
     * Verifica si existe un usuario con el email especificado
     */
    Boolean existsByEmail(String email);
}
