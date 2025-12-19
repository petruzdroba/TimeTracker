package com.pz.backend.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        int workHours,
        int vacationDays,
        int personalTime,
        String role
) {}
