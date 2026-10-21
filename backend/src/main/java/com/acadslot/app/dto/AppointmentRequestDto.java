package com.acadslot.app.dto;

import lombok.Data;

@Data
public class AppointmentRequestDto {
    private Long slotId;
    private String reason;
}
