package com.smartlogix.auth.service;

import com.smartlogix.auth.dto.AuthResponse;
import com.smartlogix.auth.dto.JwtToken;
import com.smartlogix.auth.dto.LoginRequest;
import com.smartlogix.auth.dto.RegisterRequest;
import com.smartlogix.auth.dto.UserResponse;
import com.smartlogix.auth.exception.BusinessRuleException;
import com.smartlogix.auth.exception.InvalidCredentialsException;
import com.smartlogix.auth.exception.UserDisabledException;
import com.smartlogix.auth.model.User;
import com.smartlogix.auth.repository.UserRepository;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    /*
     * Servicio de autenticacion.
     * Solo este microservicio registra usuarios, valida credenciales y emite JWT.
     */
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            UserService userService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessRuleException("Ya existe un usuario con email " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(trimToNull(request.firstName()));
        user.setLastName(trimToNull(request.lastName()));
        user.setEnabled(true);
        user.setRoles(userService.resolveRolesOrDefault(Set.of("CLIENTE")));

        User savedUser = userRepository.save(user);
        JwtToken token = jwtService.createToken(savedUser);
        return AuthResponse.bearer(token.value(), token.expiresAt(), UserResponse.from(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        if (!user.isEnabled()) {
            throw new UserDisabledException();
        }

        JwtToken token = jwtService.createToken(user);
        return AuthResponse.bearer(token.value(), token.expiresAt(), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        return UserResponse.from(userService.findEntityByIdWithRoles(userId));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
