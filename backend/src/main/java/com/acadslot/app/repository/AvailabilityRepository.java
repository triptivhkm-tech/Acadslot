package com.acadslot.app.repository;

import com.acadslot.app.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByTeacherIdOrderByDateAscStartTimeAsc(Long teacherId);
    List<Availability> findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate date);
    List<Availability> findByTeacherIdAndDate(Long teacherId, LocalDate date);
}
