package com.smartlogix.auth.repository;

import com.smartlogix.auth.model.Role;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/*
 * Repositorio JPA para roles.
 * Los roles son propios del auth-service y se cargan desde la migracion inicial.
 */
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(String name);

    List<Role> findByNameIn(Collection<String> names);
}
