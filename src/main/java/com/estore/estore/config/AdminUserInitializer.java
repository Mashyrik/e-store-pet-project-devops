package com.estore.estore.config;

import com.estore.estore.model.Role;
import com.estore.estore.model.User;
import com.estore.estore.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.enabled:false}")
    private boolean adminBootstrapEnabled;

    @Value("${app.bootstrap.admin.username:admin}")
    private String adminUsername;

    @Value("${app.bootstrap.admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap.test-user.enabled:false}")
    private boolean testUserBootstrapEnabled;

    @Value("${app.bootstrap.test-user.username:user}")
    private String testUsername;

    @Value("${app.bootstrap.test-user.email:}")
    private String testUserEmail;

    @Value("${app.bootstrap.test-user.password:}")
    private String testUserPassword;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminBootstrapEnabled) {
            createUserIfMissing(
                    "administrator",
                    adminUsername,
                    adminEmail,
                    adminPassword,
                    Role.ROLE_ADMIN
            );
        }

        if (testUserBootstrapEnabled) {
            createUserIfMissing(
                    "test user",
                    testUsername,
                    testUserEmail,
                    testUserPassword,
                    Role.ROLE_USER
            );
        }
    }

    private void createUserIfMissing(
            String userType,
            String username,
            String email,
            String password,
            Role role
    ) {
        requireValue(username, userType + " username");
        requireValue(email, userType + " email");
        requireValue(password, userType + " password");

        if (userRepository.findByUsername(username).isPresent()) {
            log.info("Bootstrap skipped: {} '{}' already exists", userType, username);
            return;
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException(
                    "Cannot create " + userType + ": email is already in use"
            );
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);

        log.info("Bootstrap created {} '{}'", userType, username);
    }

    private void requireValue(String value, String propertyDescription) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Cannot bootstrap user: " + propertyDescription + " is required"
            );
        }
    }
}
