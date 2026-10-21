package com.acadslot.app.service;

import com.acadslot.app.entity.Appointment;
import com.acadslot.app.entity.AppointmentRequest;
import com.acadslot.app.entity.Availability;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.enums.AppointmentStatus;
import com.acadslot.app.entity.enums.NotificationType;
import com.acadslot.app.entity.enums.RequestStatus;
import com.acadslot.app.repository.AppointmentRepository;
import com.acadslot.app.repository.AppointmentRequestRepository;
import com.acadslot.app.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestAndApprovalService {

    private final AppointmentRequestRepository requestRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;
    private final NotificationService notificationService;

    // ==========================================
    // STUDENT: Submit Request
    // ==========================================
    @Transactional
    public AppointmentRequest submitRequest(User student, Long availabilityId, LocalTime reqStart, Integer duration, String reason) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        // RULE 4: Duration strictly 5, 10, or 15 mins (as specified in prompt requirement 6.4)
        if (duration == null || (duration != 5 && duration != 10 && duration != 15)) {
            throw new RuntimeException("Appointment duration must be strictly 5 min, 10 min, or 15 min.");
        }

        // RULE 8: Student can only have ONE active pending/accepted request per teacher
        boolean hasActive = requestRepository.existsByStudentAndTeacherAndStatusIn(
                student, availability.getTeacher(), List.of(RequestStatus.PENDING, RequestStatus.ACCEPTED)
        );
        if (hasActive) {
            throw new RuntimeException("You already have an active request or confirmed appointment with " + availability.getTeacher().getName() + ".");
        }

        // RULE 5: Request must fit completely inside availability window
        LocalTime reqEnd = reqStart.plusMinutes(duration);
        if (reqStart.isBefore(availability.getStartTime()) || reqEnd.isAfter(availability.getEndTime())) {
            throw new RuntimeException("Requested time (" + reqStart + " - " + reqEnd + ") does not fit within the faculty's available window (" + availability.getStartTime() + " - " + availability.getEndTime() + ").");
        }

        // Pre-check: Check if this slot already overlaps with an existing confirmed appointment
        List<Appointment> existingAppointments = appointmentRepository
                .findByTeacherIdAndDateAndStatus(availability.getTeacher().getId(), availability.getDate(), AppointmentStatus.UPCOMING);
        for (Appointment existing : existingAppointments) {
            if (reqStart.isBefore(existing.getEndTime()) && reqEnd.isAfter(existing.getStartTime())) {
                throw new RuntimeException("The selected time slot is already booked. Please choose a different time slot.");
            }
        }

        AppointmentRequest request = new AppointmentRequest();
        request.setStudent(student);
        request.setTeacher(availability.getTeacher());
        request.setAvailability(availability);
        request.setRequestedStartTime(reqStart);
        request.setRequestedDuration(duration);
        request.setReason(reason);
        request.setStatus(RequestStatus.PENDING);

        AppointmentRequest savedRequest = requestRepository.save(request);

        // Notify faculty about incoming request
        notificationService.createNotification(
                availability.getTeacher(),
                "New Booking Request",
                student.getName() + " has requested a " + duration + "-min session on " + availability.getDate() + " at " + reqStart + " for " + availability.getSubject() + ".",
                NotificationType.APPOINTMENT_REQUESTED
        );

        return savedRequest;
    }

    // ==========================================
    // TEACHER: Approve Request
    // ==========================================
    @Transactional
    public Appointment approveRequest(Long requestId, User teacher, String customVenue) {
        AppointmentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: You can only manage requests assigned to you.");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is no longer pending (current status: " + request.getStatus() + ").");
        }

        LocalTime newStart = request.getRequestedStartTime();
        LocalTime newEnd = newStart.plusMinutes(request.getRequestedDuration());
        LocalDate date = request.getAvailability().getDate();

        // RULE 6 & 10: Overlap Detection
        List<Appointment> existingAppointments = appointmentRepository
                .findByTeacherIdAndDateAndStatus(teacher.getId(), date, AppointmentStatus.UPCOMING);

        for (Appointment existing : existingAppointments) {
            if (newStart.isBefore(existing.getEndTime()) && newEnd.isAfter(existing.getStartTime())) {
                throw new RuntimeException("Conflict: This request overlaps with an already confirmed appointment (" + existing.getStartTime() + " - " + existing.getEndTime() + ").");
            }
        }

        // All checks passed! Update request status to ACCEPTED
        request.setStatus(RequestStatus.ACCEPTED);
        requestRepository.save(request);

        // Determine venue: customVenue > availability venue > teacher default venue > default
        String assignedVenue = (customVenue != null && !customVenue.trim().isEmpty())
                ? customVenue.trim()
                : (request.getAvailability().getVenue() != null && !request.getAvailability().getVenue().trim().isEmpty())
                ? request.getAvailability().getVenue().trim()
                : (teacher.getDefaultVenue() != null && !teacher.getDefaultVenue().trim().isEmpty())
                ? teacher.getDefaultVenue().trim()
                : "Faculty Staff Room";

        // Update availability venue if needed
        request.getAvailability().setVenue(assignedVenue);
        availabilityRepository.save(request.getAvailability());

        Appointment appointment = new Appointment();
        appointment.setRequest(request);
        appointment.setStudent(request.getStudent());
        appointment.setTeacher(teacher);
        appointment.setDate(date);
        appointment.setStartTime(newStart);
        appointment.setEndTime(newEnd);
        appointment.setDuration(request.getRequestedDuration());
        appointment.setTitle(request.getAvailability().getSubject() != null ? request.getAvailability().getSubject() : "Doubt Session");
        appointment.setVenue(assignedVenue);
        appointment.setStatus(AppointmentStatus.UPCOMING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Notify Student
        notificationService.createNotification(
                request.getStudent(),
                "Appointment Confirmed!",
                "Prof. " + teacher.getName() + " accepted your request for " + date + " at " + newStart + " (" + assignedVenue + ").",
                NotificationType.APPOINTMENT_ACCEPTED
        );

        return savedAppointment;
    }

    public Appointment approveRequest(Long requestId, User teacher) {
        return approveRequest(requestId, teacher, null);
    }

    // ==========================================
    // TEACHER: Reject Request
    // ==========================================
    @Transactional
    public void rejectRequest(Long requestId, User teacher) {
        AppointmentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: You can only manage requests assigned to you.");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected.");
        }

        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);

        // Notify Student
        notificationService.createNotification(
                request.getStudent(),
                "Request Not Accepted",
                "Your doubt request for " + request.getAvailability().getDate() + " was not accepted by Prof. " + teacher.getName() + ".",
                NotificationType.APPOINTMENT_REJECTED
        );
    }

    // ==========================================
    // TEACHER: Mark Appointment as Completed (Requirement 12)
    // ==========================================
    @Transactional
    public Appointment completeAppointment(Long appointmentId, User teacher) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: You can only manage your own appointments.");
        }
        if (appointment.getStatus() != AppointmentStatus.UPCOMING) {
            throw new RuntimeException("Only upcoming appointments can be marked as completed.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        if (appointment.getRequest() != null) {
            appointment.getRequest().setStatus(RequestStatus.COMPLETED);
            requestRepository.save(appointment.getRequest());
        }

        // Notify student that session was completed
        notificationService.createNotification(
                appointment.getStudent(),
                "Session Completed",
                "Your doubt session on " + appointment.getDate() + " with Prof. " + teacher.getName() + " has been marked as completed.",
                NotificationType.APPOINTMENT_ACCEPTED
        );

        return savedAppointment;
    }

    // ==========================================
    // TEACHER: Cancel Confirmed Appointment
    // ==========================================
    @Transactional
    public void cancelAppointment(Long appointmentId, String cancelReason, User teacher) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: You can only manage your own appointments.");
        }
        if (appointment.getStatus() != AppointmentStatus.UPCOMING) {
            throw new RuntimeException("Only upcoming appointments can be cancelled.");
        }
        if (cancelReason == null || cancelReason.trim().isEmpty()) {
            throw new RuntimeException("Cancellation reason is strictly required.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(cancelReason);

        AppointmentRequest request = appointment.getRequest();
        if (request != null) {
            request.setStatus(RequestStatus.CANCELLED);
            requestRepository.save(request);
        }

        appointmentRepository.save(appointment);

        // Notify student
        notificationService.createNotification(
                appointment.getStudent(),
                "Appointment Cancelled",
                "Your appointment on " + appointment.getDate() + " has been cancelled. Reason: " + cancelReason,
                NotificationType.APPOINTMENT_CANCELLED
        );
    }
}
