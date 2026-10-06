package com.estore.estore.controller;

import com.estore.estore.dto.request.LoginRequest;
import com.estore.estore.dto.request.RegisterRequest;
import com.estore.estore.dto.response.JwtResponse;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.DuplicateResourceException;
import com.estore.estore.model.User;
import com.estore.estore.model.Role;
import com.estore.estore.security.JwtUtils;
import com.estore.estore.security.UserPrincipal;
import com.estore.estore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    userPrincipal.getAuthorities().iterator().next().getAuthority()
            ));
        } catch (BadCredentialsException e) {
            throw new BusinessException("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userService.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        if (userService.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("Email is already in use");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                Role.ROLE_USER
        );

        userService.saveUser(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public String testAuth() {
        return "Auth controller работает!";
    }
}
