package com.acadslot.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.acadslot.app.dto.ApiResponse;
import com.acadslot.app.dto.SystemStatsDto;
import com.acadslot.app.entity.Appointment;
import com.acadslot.app.entity.AppointmentRequest;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.Venue;
import com.acadslot.app.entity.enums.AppointmentStatus;
import com.acadslot.app.entity.enums.RequestStatus;
import com.acadslot.app.entity.enums.Role;
import com.acadslot.app.repository.AppointmentRepository;
import com.acadslot.app.repository.AppointmentRequestRepository;
import com.acadslot.app.repository.AvailabilityRepository;
import com.acadslot.app.repository.UserRepository;
import com.acadslot.app.repository.VenueRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentRequestRepository requestRepository;
    private final AvailabilityRepository availabilityRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    // GET /api/admin/dashboard and /api/admin/stats (Stats)
    @GetMapping({ "/dashboard", "/stats" })
    public ResponseEntity<ApiResponse<AdminStatsDto>> getSystemStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalStudents(userRepository.findByRole(Role.STUDENT).size());
        stats.setTotalTeachers(userRepository.findByRoleIn(List.of(Role.TEACHER, Role.PROFESSOR)).size());
        stats.setTotalVenues((int) venueRepository.count());
        stats.setTotalPendingRequests(
                requestRepository.findAll().stream().filter(r -> r.getStatus() == RequestStatus.PENDING).count());
        stats.setTotalUpcomingAppointments(
                appointmentRepository.findAll().stream().filter(a -> a.getStatus() == AppointmentStatus.UPCOMING)
                        .count());
        stats.setTotalCompletedAppointments(
                appointmentRepository.findAll().stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                        .count());

        return ResponseEntity.ok(ApiResponse.success("System stats retrieved", stats));
    }

    // GET /api/admin/faculty
    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<User>>> getFaculty() {
        List<User> list = userRepository.findByRoleIn(List.of(Role.TEACHER, Role.PROFESSOR));
        return ResponseEntity.ok(ApiResponse.success("Faculty members retrieved", list));
    }

    // POST /api/admin/faculty (Requirement 3: Admin adds faculty members)
    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<User>> addFaculty(@RequestBody CreateFacultyDto dto) {
        if (dto.getEmail() == null || dto.getName() == null || dto.getPassword() == null) {
            throw new RuntimeException("Name, email, and password are required");
        }

        if (userRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("An account with email " + dto.getEmail() + " already exists.");
        }

        User faculty = new User();
        faculty.setName(dto.getName().trim());
        faculty.setEmail(dto.getEmail().trim().toLowerCase());
        faculty.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        faculty.setRole(Role.TEACHER);
        faculty.setDepartment(dto.getDepartment() != null ? dto.getDepartment().trim() : "Engineering");
        faculty.setSubject(dto.getSubject() != null ? dto.getSubject().trim() : "Core");
        faculty.setDefaultVenue(dto.getDefaultVenue() != null ? dto.getDefaultVenue().trim() : "Staff Room");
        faculty.setIdentifier(
                dto.getIdentifier() != null ? dto.getIdentifier().trim() : "FAC-" + System.currentTimeMillis() % 10000);
        faculty.setActive(true);

        User saved = userRepository.save(faculty);
        return ResponseEntity.ok(ApiResponse.success("Faculty account created successfully", saved));
    }

    // PUT /api/admin/faculty/{id}
    @PutMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<User>> updateFaculty(
            @PathVariable("id") Long id,
            @RequestBody CreateFacultyDto dto) {
        User faculty = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty member not found"));

        if (dto.getName() != null)
            faculty.setName(dto.getName().trim());
        if (dto.getDepartment() != null)
            faculty.setDepartment(dto.getDepartment().trim());
        if (dto.getSubject() != null)
            faculty.setSubject(dto.getSubject().trim());
        if (dto.getDefaultVenue() != null)
            faculty.setDefaultVenue(dto.getDefaultVenue().trim());
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            faculty.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        User updated = userRepository.save(faculty);
        return ResponseEntity.ok(ApiResponse.success("Faculty member updated successfully", updated));
    }

    // GET /api/admin/students
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> getStudents() {
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", userRepository.findByRole(Role.STUDENT)));
    }

    // PATCH /api/admin/users/{id}/status (Enable/Disable User)
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable("id") Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(!user.isActive());
        userRepository.save(user);

        String state = user.isActive() ? "enabled" : "disabled";
        return ResponseEntity.ok(ApiResponse.success("User successfully " + state, null));
    }

    @GetMapping("/venues")
    public ResponseEntity<ApiResponse<List<Venue>>> getVenues() {
        return ResponseEntity.ok(ApiResponse.success("Venues retrieved", venueRepository.findAll()));
    }

    // POST /api/admin/venues
    @PostMapping("/venues")
    public ResponseEntity<ApiResponse<Venue>> addVenue(@RequestBody Venue venue) {
        if (venue.getName() == null || venue.getName().trim().isEmpty()) {
            throw new RuntimeException("Venue name is required");
        }
        Venue saved = venueRepository.save(venue);
        return ResponseEntity.ok(ApiResponse.success("Venue created successfully", saved));
    }

    // DELETE /api/admin/venues/{id}
    @DeleteMapping("/venues/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVenue(@PathVariable("id") Long id) {
        venueRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Venue deleted successfully", null));
    }

    // GET /api/admin/bookings (Requirement 3: View records)
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success("All bookings retrieved", appointmentRepository.findAll()));
    }

    // GET /api/admin/requests
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<AppointmentRequest>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success("All requests retrieved", requestRepository.findAll()));
    }
}

@Data
class CreateFacultyDto {
    private String name;
    private String email;
    private String password;
    private String department;
    private String subject;
    private String defaultVenue;
    private String identifier;
}

@Data
class AdminStatsDto {
    private int totalStudents;
    private int totalTeachers;
    private int totalVenues;
    private long totalPendingRequests;
    private long totalUpcomingAppointments;
    private long totalCompletedAppointments;
}
