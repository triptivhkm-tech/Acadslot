package com.acadslot.app.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.acadslot.app.dto.ApiResponse;
import com.acadslot.app.dto.CancelDto;
import com.acadslot.app.dto.CreateAvailabilityRequest;
import com.acadslot.app.entity.Appointment;
import com.acadslot.app.entity.AppointmentRequest;
import com.acadslot.app.entity.Availability;
import com.acadslot.app.entity.User;
import com.acadslot.app.repository.AppointmentRepository;
import com.acadslot.app.repository.AppointmentRequestRepository;
import com.acadslot.app.repository.AvailabilityRepository;
import com.acadslot.app.repository.UserRepository;
import com.acadslot.app.service.RequestAndApprovalService;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final RequestAndApprovalService approvalService;
    private final AppointmentRequestRepository requestRepository;
    private final AppointmentRepository appointmentRepository;

    // GET /api/teacher/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@RequestAttribute("userId") Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", teacher));
    }

    // GET /api/teacher/availability (Requirement 4)
    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<Availability>>> getMyAvailability(
            @RequestAttribute("userId") Long teacherId) {
        List<Availability> list = availabilityRepository.findByTeacherIdOrderByDateAscStartTimeAsc(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved", list));
    }

    // POST /api/teacher/availability (Requirement 4)
    @PostMapping("/availability")
    public ResponseEntity<ApiResponse<Availability>> createAvailability(
            @RequestAttribute("userId") Long teacherId,
            @Valid @RequestBody CreateAvailabilityRequest dto) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        Availability availability = new Availability();
        availability.setTeacher(teacher);
        availability.setDate(dto.getDate());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setVenue(dto.getVenue() != null && !dto.getVenue().trim().isEmpty() ? dto.getVenue() : teacher.getDefaultVenue());
        availability.setSubject(dto.getSubject() != null && !dto.getSubject().trim().isEmpty() ? dto.getSubject() : teacher.getSubject());
        availability.setDescription(dto.getDescription());

        Availability saved = availabilityRepository.save(availability);
        return ResponseEntity.ok(ApiResponse.success("Availability published successfully", saved));
    }

    // DELETE /api/teacher/availability/{id}
    @DeleteMapping("/availability/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(
            @RequestAttribute("userId") Long teacherId,
            @PathVariable("id") Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        if (!availability.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized");
        }

        availabilityRepository.delete(availability);
        return ResponseEntity.ok(ApiResponse.success("Availability slot removed", null));
    }

    // GET /api/teacher/requests (Requirement 7 - Incoming Booking Requests)
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<AppointmentRequest>>> getMyRequests(
            @RequestAttribute("userId") Long teacherId) {
        List<AppointmentRequest> requests = requestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Incoming requests fetched", requests));
    }

    // PATCH or POST /api/teacher/requests/{id}/approve (Requirement 8 - Accept Request)
    @RequestMapping(value = "/requests/{id}/approve", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Appointment>> approveRequest(
            @RequestAttribute("userId") Long teacherId,
            @PathVariable("id") Long requestId,
            @RequestBody(required = false) ApproveVenueDto venueDto) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String customVenue = venueDto != null ? venueDto.getVenue() : null;
        Appointment confirmedAppointment = approvalService.approveRequest(requestId, teacher, customVenue);

        return ResponseEntity.ok(ApiResponse.success("Request approved and confirmed! Added to your To-Do List.", confirmedAppointment));
    }

    // PATCH or POST /api/teacher/requests/{id}/reject (Requirement 9 - Reject Request)
    @RequestMapping(value = "/requests/{id}/reject", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @RequestAttribute("userId") Long teacherId,
            @PathVariable("id") Long requestId) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        approvalService.rejectRequest(requestId, teacher);
        return ResponseEntity.ok(ApiResponse.success("Request rejected successfully", null));
    }

    // GET /api/teacher/appointments (Requirement 8 - Faculty To-Do List)
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyAppointments(
            @RequestAttribute("userId") Long teacherId) {
        // Faculty To-Do List and session list
        List<Appointment> appointments = appointmentRepository.findByTeacherIdOrderByDateDesc(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Appointments fetched for To-Do List", appointments));
    }

    // PATCH or POST /api/teacher/appointments/{id}/complete (Requirement 12 - Mark as Completed)
    @RequestMapping(value = "/appointments/{id}/complete", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Appointment>> completeAppointment(
            @RequestAttribute("userId") Long teacherId,
            @PathVariable("id") Long appointmentId) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Appointment completed = approvalService.completeAppointment(appointmentId, teacher);
        return ResponseEntity.ok(ApiResponse.success("Session marked as completed!", completed));
    }

    // PATCH or POST /api/teacher/appointments/{id}/cancel
    @RequestMapping(value = "/appointments/{id}/cancel", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @RequestAttribute("userId") Long teacherId,
            @PathVariable("id") Long appointmentId,
            @Valid @RequestBody CancelDto cancelDto) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        approvalService.cancelAppointment(appointmentId, cancelDto.getReason(), teacher);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", null));
    }
}

@Data
class ApproveVenueDto {
    private String venue;
}
