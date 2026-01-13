package com.pz.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDateTime;

public record WorkLogPutRequest(
        @NotNull(message = "Work log ID must be provided")
        Long id,
        @NotNull(message = "User ID must be provided")
        Long userId,
        @NotNull(message = "Date must be provided")
        @Past(message = "Date cannot be in the future/today")
        LocalDateTime date,
        @NotNull(message = "Time worked must be provided")
        Long timeWorked) {
}
