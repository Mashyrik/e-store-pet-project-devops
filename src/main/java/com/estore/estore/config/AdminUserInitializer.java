package com.estore.estore.config;

import com.estore.estore.model.Role;
import com.estore.estore.model.User;
import com.estore.estore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЕЙ ===");

        // Создаем администратора, если он не существует
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@estore.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Администратор создан: admin / admin123");
        } else {
            System.out.println("👑 Администратор уже существует");
        }

        // Создаем тестового пользователя, если он не существует
        if (userRepository.findByUsername("user").isEmpty()) {
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@estore.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(Role.ROLE_USER);
            userRepository.save(user);
            System.out.println("✅ Пользователь создан: user / user123");
        } else {
            System.out.println("👤 Пользователь уже существует");
        }

        // Проверяем количество пользователей в системе
        long userCount = userRepository.count();
        System.out.println("📊 Всего пользователей в системе: " + userCount);

        System.out.println("=== ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===");
    }
}
