package com.acadslot.app.dto;

import java.time.LocalTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SubmitAppointmentRequestDto {
    @NotNull(message = "Availability id is required")
    private Long availabilityId;

    @NotNull(message = "Start time is required")
    private LocalTime requestedStartTime;

    @NotNull(message = "Duration is required")
    @Positive(message = "duration should not be negative")
    private Integer requestedDuration;

    @NotBlank(message = "Academic reason is required")
    private String reason;

    public void setStartTime(LocalTime startTime) {
        if (this.requestedStartTime == null) {
            this.requestedStartTime = startTime;
        }
    }

    public void setDurationMinutes(Integer durationMinutes) {
        if (this.requestedDuration == null) {
            this.requestedDuration = durationMinutes;
        }
    }

    public void setDoubtTopic(String doubtTopic) {
        if (this.reason == null) {
            this.reason = doubtTopic;
        }
    }
}
