package com.estore.estore.controller;

import com.estore.estore.dto.request.UpdateProfileRequest;
import com.estore.estore.dto.response.UserProfileResponse;
import com.estore.estore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        UserProfileResponse profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updatedProfile = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserInfo());
    }
}
