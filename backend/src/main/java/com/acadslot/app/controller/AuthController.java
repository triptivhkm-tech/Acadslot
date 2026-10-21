package com.acadslot.app.controller;

import com.acadslot.app.dto.ApiResponse;
import com.acadslot.app.dto.AuthResponseDto;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.enums.Role;
import com.acadslot.app.repository.UserRepository;
import com.acadslot.app.security.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and password are required"));
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid credentials or account does not exist."));

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("This account has been deactivated. Please contact the administrator."));
        }

        // Verify password hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password.");
        }

        // Role verification if requested
        if (request.getExpectedRole() != null && !request.getExpectedRole().trim().isEmpty()) {
            String expected = request.getExpectedRole().trim().toUpperCase();
            String userRole = user.getRole().name();
            // Allow TEACHER / PROFESSOR interchangeability
            boolean match = userRole.equals(expected) || 
                    (expected.equals("FACULTY") && (userRole.equals("TEACHER") || userRole.equals("PROFESSOR"))) ||
                    (expected.equals("PROFESSOR") && (userRole.equals("TEACHER") || userRole.equals("PROFESSOR")));
            
            if (!match) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized: Your account role does not have permission for the " + request.getExpectedRole() + " portal."));
            }
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user);
        AuthResponseDto responseData = new AuthResponseDto(
                token,
                user.getRole(),
                user.getName(),
                user.getEmail(),
                user.getId(),
                user.getDepartment(),
                user.getSubject(),
                user.getDefaultVenue()
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> googleLogin(@RequestBody GoogleLoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required for Google authentication."));
        }

        String email = request.getEmail().trim().toLowerCase();

        // STRICT TCET DOMAIN VALIDATION
        // Requirement 2: Backend validates the verified email and checks that the account belongs to
        // authorized TCET college domain (@tcetmumbai.in). Personal email accounts must NOT be permitted.
        if (!email.endsWith("@tcetmumbai.in")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Only TCET college Google Workspace accounts (@tcetmumbai.in) are authorized for student access. Personal email accounts are not permitted."));
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Auto-provision verified TCET student account
            user = new User();
            user.setEmail(email);
            user.setName(request.getName() != null && !request.getName().trim().isEmpty() ? request.getName().trim() : email.split("@")[0]);
            user.setRole(Role.STUDENT);
            user.setIdentifier("TCET-" + (System.currentTimeMillis() % 1000000));
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setActive(true);
            user = userRepository.save(user);
        } else {
            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Your student account is deactivated. Please contact college admin."));
            }
            if (user.getRole() != Role.STUDENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("This account is registered with role " + user.getRole() + ", not as a student."));
            }
        }

        String token = jwtUtil.generateToken(user);
        AuthResponseDto responseData = new AuthResponseDto(
                token,
                user.getRole(),
                user.getName(),
                user.getEmail(),
                user.getId(),
                user.getDepartment(),
                user.getSubject(),
                user.getDefaultVenue()
        );

        return ResponseEntity.ok(ApiResponse.success("Student Google authentication successful", responseData));
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
    private String expectedRole;
}

@Data
class GoogleLoginRequest {
    private String email;
    private String name;
    private String googleToken;
}
