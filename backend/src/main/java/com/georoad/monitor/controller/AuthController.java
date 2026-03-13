package com.georoad.monitor.controller;

import com.georoad.monitor.model.User;
import com.georoad.monitor.repository.UserRepository;
import com.georoad.monitor.security.JwtUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmailAddress(request.getEmail())
                .filter(u -> u.getPassword().equals(request.getPassword())) 
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        String token = jwtUtils.generateJwtToken(user.getEmailAddress(), user.getRole().name());
        
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", user
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmailAddress(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = User.builder()
                .userName(request.getName())
                .emailAddress(request.getEmail())
                .password(request.getPassword())
                .role(User.Role.USER) // Default role
                .build();

        return ResponseEntity.ok(userRepository.save(user));
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }
}
