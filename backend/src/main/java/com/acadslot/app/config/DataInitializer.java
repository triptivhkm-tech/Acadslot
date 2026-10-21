package com.acadslot.app.config;

import com.acadslot.app.entity.Availability;
import com.acadslot.app.entity.User;
import com.acadslot.app.entity.Venue;
import com.acadslot.app.entity.enums.Role;
import com.acadslot.app.repository.AvailabilityRepository;
import com.acadslot.app.repository.UserRepository;
import com.acadslot.app.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing AcadSlot database seed data...");

        // 1. Seed Venues / Staff Rooms
        if (venueRepository.count() == 0) {
            venueRepository.saveAll(List.of(
                    new Venue(null, "Staff Room 402", "Computer Engineering - 4th Floor", "Main faculty cabin for Computer Engineering"),
                    new Venue(null, "Staff Room 305", "Information Technology - 3rd Floor", "Main IT department staff room"),
                    new Venue(null, "Lab 501", "Computing Block - 5th Floor", "Advanced DBMS and Operating Systems Lab"),
                    new Venue(null, "Faculty Cabin 201", "AI & Data Science Block - 2nd Floor", "AI & DS Faculty Cubicles"),
                    new Venue(null, "Seminar Hall A", "Ground Floor", "College Seminar and Doubt Clearing Hall")
            ));
            log.info("Default venues seeded.");
        }

        // 2. Seed Admin
        if (!userRepository.existsByEmail("admin@acadslot.com")) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@acadslot.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setIdentifier("ADM-001");
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Admin account seeded (admin@acadslot.com / admin123).");
        }

        // 3. Seed Faculty Members (Matching Reference Image 1)
        User profSharma = userRepository.findByEmail("sharma@tcetmumbai.in").orElseGet(() -> {
            User u = new User();
            u.setName("Prof. Sharma");
            u.setEmail("sharma@tcetmumbai.in");
            u.setPasswordHash(passwordEncoder.encode("faculty123"));
            u.setRole(Role.TEACHER);
            u.setDepartment("Computer Engineering");
            u.setSubject("DBMS");
            u.setDefaultVenue("Staff Room 402");
            u.setIdentifier("FAC-TCET-101");
            u.setActive(true);
            return userRepository.save(u);
        });

        User profMehta = userRepository.findByEmail("mehta@tcetmumbai.in").orElseGet(() -> {
            User u = new User();
            u.setName("Prof. Mehta");
            u.setEmail("mehta@tcetmumbai.in");
            u.setPasswordHash(passwordEncoder.encode("faculty123"));
            u.setRole(Role.TEACHER);
            u.setDepartment("Computer Engineering");
            u.setSubject("Java Programming");
            u.setDefaultVenue("Staff Room 402");
            u.setIdentifier("FAC-TCET-102");
            u.setActive(true);
            return userRepository.save(u);
        });

        User profPatil = userRepository.findByEmail("patil@tcetmumbai.in").orElseGet(() -> {
            User u = new User();
            u.setName("Prof. Patil");
            u.setEmail("patil@tcetmumbai.in");
            u.setPasswordHash(passwordEncoder.encode("faculty123"));
            u.setRole(Role.TEACHER);
            u.setDepartment("Information Technology");
            u.setSubject("Data Structures");
            u.setDefaultVenue("Staff Room 305");
            u.setIdentifier("FAC-TCET-103");
            u.setActive(true);
            return userRepository.save(u);
        });

        User profKulkarni = userRepository.findByEmail("kulkarni@tcetmumbai.in").orElseGet(() -> {
            User u = new User();
            u.setName("Prof. Kulkarni");
            u.setEmail("kulkarni@tcetmumbai.in");
            u.setPasswordHash(passwordEncoder.encode("faculty123"));
            u.setRole(Role.TEACHER);
            u.setDepartment("AI & Data Science");
            u.setSubject("Machine Learning");
            u.setDefaultVenue("Faculty Cabin 201");
            u.setIdentifier("FAC-TCET-104");
            u.setActive(true);
            return userRepository.save(u);
        });

        // 4. Seed Demo Student
        if (!userRepository.existsByEmail("student@tcetmumbai.in")) {
            User student = new User();
            student.setName("Aarav Patel");
            student.setEmail("student@tcetmumbai.in");
            student.setPasswordHash(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setDepartment("Computer Engineering");
            student.setIdentifier("TCET2026CS101");
            student.setActive(true);
            userRepository.save(student);
            log.info("Demo student seeded (student@tcetmumbai.in).");
        }

        // 5. Seed Availabilities if empty (Matching Reference Image 1)
        if (availabilityRepository.count() == 0) {
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            LocalDate dayAfter = today.plusDays(2);

            // Prof. Sharma slots
            Availability a1 = new Availability(null, LocalTime.of(11, 0), LocalTime.of(12, 30), today, profSharma, "Staff Room 402", "DBMS", "Database Indexing & Normalization Queries");
            Availability a2 = new Availability(null, LocalTime.of(14, 30), LocalTime.of(15, 30), tomorrow, profSharma, "Staff Room 402", "DBMS", "SQL Queries & Transactions");
            Availability a3 = new Availability(null, LocalTime.of(16, 0), LocalTime.of(17, 0), dayAfter, profSharma, "Staff Room 402", "DBMS", "NoSQL Architecture Doubts");

            // Prof. Mehta slots
            Availability a4 = new Availability(null, LocalTime.of(12, 0), LocalTime.of(13, 0), today, profMehta, "Staff Room 402", "Java Programming", "OOP Concepts & Multithreading Doubts");
            Availability a5 = new Availability(null, LocalTime.of(14, 0), LocalTime.of(15, 0), tomorrow, profMehta, "Staff Room 402", "Java Programming", "Collections Framework");

            // Prof. Patil slots
            Availability a6 = new Availability(null, LocalTime.of(14, 0), LocalTime.of(15, 30), today, profPatil, "Staff Room 305", "Data Structures", "Trees, Graphs & Dynamic Programming");
            Availability a7 = new Availability(null, LocalTime.of(10, 0), LocalTime.of(11, 30), tomorrow, profPatil, "Staff Room 305", "Data Structures", "Linked Lists & Stack Doubts");

            // Prof. Kulkarni slots
            Availability a8 = new Availability(null, LocalTime.of(15, 0), LocalTime.of(16, 30), tomorrow, profKulkarni, "Faculty Cabin 201", "Machine Learning", "Neural Networks & Regression");

            availabilityRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6, a7, a8));
            log.info("Initial faculty availabilities seeded.");
        }

        log.info("AcadSlot seed data initialization complete.");
    }
}
