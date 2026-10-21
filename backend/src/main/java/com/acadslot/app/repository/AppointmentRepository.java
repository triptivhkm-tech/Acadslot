package com.acadslot.app.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acadslot.app.entity.Appointment;
import com.acadslot.app.entity.enums.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByTeacherIdAndDateAndStatus(Long teacherId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByTeacherIdOrderByDateDesc(Long teacherId);

    List<Appointment> findByStudentIdOrderByDateDesc(Long studentId);
}
