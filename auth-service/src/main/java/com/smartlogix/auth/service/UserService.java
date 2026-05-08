package com.smartlogix.auth.service;

import com.smartlogix.auth.dto.RoleUpdateRequest;
import com.smartlogix.auth.dto.UserCreateRequest;
import com.smartlogix.auth.dto.UserResponse;
import com.smartlogix.auth.dto.UserStatusUpdateRequest;
import com.smartlogix.auth.dto.UserUpdateRequest;
import com.smartlogix.auth.exception.BusinessRuleException;
import com.smartlogix.auth.exception.ResourceNotFoundException;
import com.smartlogix.auth.model.Role;
import com.smartlogix.auth.model.User;
import com.smartlogix.auth.repository.RoleRepository;
import com.smartlogix.auth.repository.UserRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    /*
     * Servicio administrativo de usuarios.
     * Mantiene las reglas fuera de los controladores y nunca devuelve entidades.
     */
    private static final String DEFAULT_ROLE = "CLIENTE";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll(Sort.by("email").ascending()).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.from(findEntityByIdWithRoles(id));
    }

    public UserResponse create(UserCreateRequest request) {
        String email = normalizeEmail(request.email());
        validateEmailAvailable(email, null);

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(trimToNull(request.firstName()));
        user.setLastName(trimToNull(request.lastName()));
        user.setEnabled(request.enabled() == null || request.enabled());
        user.setRoles(resolveRolesOrDefault(request.roles()));

        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse update(UUID id, UserUpdateRequest request) {
        User user = findEntityByIdWithRoles(id);
        String email = normalizeEmail(request.email());
        validateEmailAvailable(email, id);

        user.setEmail(email);
        user.setFirstName(trimToNull(request.firstName()));
        user.setLastName(trimToNull(request.lastName()));

        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse updateRoles(UUID id, RoleUpdateRequest request) {
        User user = findEntityByIdWithRoles(id);
        user.setRoles(resolveRoles(request.roles()));
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse updateStatus(UUID id, UserStatusUpdateRequest request) {
        User user = findEntityByIdWithRoles(id);
        user.setEnabled(request.enabled());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public User findEntityByIdWithRoles(UUID id) {
        return userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
    }

    Set<Role> resolveRolesOrDefault(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return resolveRoles(Set.of(DEFAULT_ROLE));
        }
        return resolveRoles(roleNames);
    }

    Set<Role> resolveRoles(Set<String> roleNames) {
        Set<String> normalizedNames = roleNames.stream()
                .map(this::normalizeRole)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Role> roles = roleRepository.findByNameIn(normalizedNames);
        Set<String> existingNames = roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> missingNames = normalizedNames.stream()
                .filter(roleName -> !existingNames.contains(roleName))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (!missingNames.isEmpty()) {
            throw new ResourceNotFoundException("Roles no encontrados: " + String.join(", ", missingNames));
        }

        return new LinkedHashSet<>(roles);
    }

    private void validateEmailAvailable(String email, UUID currentUserId) {
        if (currentUserId == null) {
            if (userRepository.existsByEmail(email)) {
                throw new BusinessRuleException("Ya existe un usuario con email " + email);
            }
            return;
        }

        userRepository.findByEmail(email)
                .filter(user -> !user.getId().equals(currentUserId))
                .ifPresent(user -> {
                    throw new BusinessRuleException("Ya existe un usuario con email " + email);
                });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeRole(String role) {
        return role.trim().toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
