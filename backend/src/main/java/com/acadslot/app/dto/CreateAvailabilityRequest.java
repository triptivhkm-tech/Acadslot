package com.acadslot.app.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAvailabilityRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time cannot null")
    private LocalTime startTime;

    @NotNull(message = "End time cannot be null")
    private LocalTime endTime;

    private String description;

    @NotNull(message = "Venue cannot be null")
    private String venue;

    @NotNull(message = "Subject cannot be null")
    private String subject;
}
