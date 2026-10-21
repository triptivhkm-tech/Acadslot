package com.acadslot.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelDto {
    @NotBlank(message = "enter reason for cancellation")
    private String reason;
}
