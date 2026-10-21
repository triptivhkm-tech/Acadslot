package com.acadslot.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acadslot.app.entity.AppointmentRequest;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.enums.RequestStatus;

@Repository
public interface AppointmentRequestRepository extends JpaRepository<AppointmentRequest, Long> {
    boolean existsByStudentAndTeacherAndStatusIn(User student, User teacher, List<RequestStatus> statuses);

    List<AppointmentRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<AppointmentRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
