package com.smartlogix.auth.config;

import com.smartlogix.auth.model.Role;
import com.smartlogix.auth.model.User;
import com.smartlogix.auth.repository.RoleRepository;
import com.smartlogix.auth.repository.UserRepository;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapAdminRunner implements ApplicationRunner {

    /*
     * Crea el primer ADMIN solo cuando se habilita explicitamente por configuracion.
     * Esto evita dejar credenciales administrativas activas por accidente.
     */
    private final boolean enabled;
    private final String email;
    private final String password;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapAdminRunner(
            @Value("${auth.bootstrap-admin.enabled:false}") boolean enabled,
            @Value("${auth.bootstrap-admin.email:}") String email,
            @Value("${auth.bootstrap-admin.password:}") String password,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.enabled = enabled;
        this.email = email;
        this.password = password;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled || userRepository.existsByEmail(normalizeEmail(email))) {
            return;
        }
        if (password == null || password.length() < 8) {
            throw new IllegalStateException("AUTH_BOOTSTRAP_ADMIN_PASSWORD debe tener al menos 8 caracteres");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("El rol ADMIN no existe en la base de datos"));

        User admin = new User();
        admin.setEmail(normalizeEmail(email));
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFirstName("SmartLogix");
        admin.setLastName("Admin");
        admin.setEnabled(true);
        admin.setRoles(Set.of(adminRole));

        userRepository.save(admin);
    }

    private String normalizeEmail(String value) {
        return value.trim().toLowerCase();
    }
}
