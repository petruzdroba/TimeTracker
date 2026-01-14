package com.pz.backend.dto;

import com.pz.backend.entity.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        int workHours,
        int vacationDays,
        int personalTime,
        Role role
) {}
