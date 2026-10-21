package com.acadslot.app.dto;

import com.acadslot.app.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private Role role;
    private String name;
    private String email;
    private Long userId;
    private String department;
    private String subject;
    private String defaultVenue;

    public AuthResponseDto(String token, Role role, String name) {
        this.token = token;
        this.role = role;
        this.name = name;
    }
}
