package com.acadslot.app.controller;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import com.acadslot.app.dto.ApiResponse;
import com.acadslot.app.dto.SubmitAppointmentRequestDto;
import com.acadslot.app.entity.Appointment;
import com.acadslot.app.entity.AppointmentRequest;
import com.acadslot.app.entity.Availability;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.enums.Role;
import com.acadslot.app.repository.AppointmentRepository;
import com.acadslot.app.repository.AppointmentRequestRepository;
import com.acadslot.app.repository.AvailabilityRepository;
import com.acadslot.app.repository.UserRepository;
import com.acadslot.app.service.RequestAndApprovalService;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRequestRepository requestRepository;
    private final AppointmentRepository appointmentRepository;
    private final RequestAndApprovalService requestService;

    // GET /api/student/faculty - Search and browse faculty (Requirement 5 & Reference Image 1)
    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<FacultyCardDto>>> getFacultyList(
            @RequestParam(value = "query", required = false) String query) {

        List<User> facultyList = userRepository.findByRoleIn(List.of(Role.TEACHER, Role.PROFESSOR));

        // Filter by active
        facultyList = facultyList.stream().filter(User::isActive).collect(Collectors.toList());

        // Search filter if provided
        if (query != null && !query.trim().isEmpty()) {
            String lower = query.trim().toLowerCase();
            facultyList = facultyList.stream()
                    .filter(f -> (f.getName() != null && f.getName().toLowerCase().contains(lower)) ||
                            (f.getDepartment() != null && f.getDepartment().toLowerCase().contains(lower)) ||
                            (f.getSubject() != null && f.getSubject().toLowerCase().contains(lower)))
                    .collect(Collectors.toList());
        }

        LocalDate today = LocalDate.now();
        List<Availability> allAvailabilities = availabilityRepository.findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(today);

        Map<Long, List<Availability>> availabilityByTeacher = allAvailabilities.stream()
                .collect(Collectors.groupingBy(a -> a.getTeacher().getId()));

        List<FacultyCardDto> dtoList = facultyList.stream().map(f -> {
            FacultyCardDto dto = new FacultyCardDto();
            dto.setId(f.getId());
            dto.setName(f.getName());
            dto.setEmail(f.getEmail());
            dto.setDepartment(f.getDepartment() != null ? f.getDepartment() : "General Engineering");
            dto.setSubject(f.getSubject() != null ? f.getSubject() : "Core Subjects");
            dto.setDefaultVenue(f.getDefaultVenue() != null ? f.getDefaultVenue() : "Faculty Staff Room");

            List<Availability> teacherSlots = availabilityByTeacher.getOrDefault(f.getId(), Collections.emptyList());
            dto.setAvailabilities(teacherSlots);

            // Compute human-friendly slots summary (e.g. "Available slots: 11:00 AM, 11:30 AM")
            if (!teacherSlots.isEmpty()) {
                Availability next = teacherSlots.get(0);
                dto.setNextAvailableDate(next.getDate().toString());
                dto.setAvailableSlotsSummary(next.getStartTime() + ", " + next.getStartTime().plusMinutes(30));
            } else {
                dto.setAvailableSlotsSummary("Slots will be published soon");
            }

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Faculty list retrieved successfully", dtoList));
    }

    // GET /api/student/availability
    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<Availability>>> getAvailability(
            @RequestParam(value = "teacherId", required = false) Long teacherId) {
        
        LocalDate today = LocalDate.now();
        List<Availability> availabilities;
        if (teacherId != null) {
            availabilities = availabilityRepository.findByTeacherIdOrderByDateAscStartTimeAsc(teacherId);
        } else {
            availabilities = availabilityRepository.findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(today);
        }
        return ResponseEntity.ok(ApiResponse.success("Availability fetched", availabilities));
    }

    // POST /api/student/requests and /api/student/book (Requirement 6)
    @PostMapping({"/requests", "/book"})
    public ResponseEntity<ApiResponse<AppointmentRequest>> submitRequest(
            @RequestAttribute("userId") Long studentId,
            @Valid @RequestBody SubmitAppointmentRequestDto dto) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        AppointmentRequest request = requestService.submitRequest(
                student,
                dto.getAvailabilityId(),
                dto.getRequestedStartTime(),
                dto.getRequestedDuration(),
                dto.getReason()
        );

        return ResponseEntity.ok(ApiResponse.success("Booking request submitted successfully and is now PENDING", request));
    }

    // GET /api/student/requests - View My Requests with tabs (Requirement 11 & Reference Image 1)
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<AppointmentRequest>>> getMyRequests(
            @RequestAttribute("userId") Long studentId) {

        List<AppointmentRequest> requests = requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student requests fetched", requests));
    }

    // GET /api/student/sessions - View My Upcoming & Completed Sessions (Requirement 8 & 11)
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMySessions(
            @RequestAttribute("userId") Long studentId) {

        List<Appointment> sessions = appointmentRepository.findByStudentIdOrderByDateDesc(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student sessions fetched", sessions));
    }
}

@Data
class FacultyCardDto {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String subject;
    private String defaultVenue;
    private String nextAvailableDate;
    private String availableSlotsSummary;
    private List<Availability> availabilities;
}
