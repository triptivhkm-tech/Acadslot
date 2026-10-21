package com.acadslot.app.dto;

import lombok.Data;

@Data
public class SystemStatsDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalPendingRequests;
    private long totalUpcomingAppointments;
}
