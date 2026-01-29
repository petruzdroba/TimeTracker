package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record LeaveRequestPutRequest(
        @JsonProperty(required = true)
        @NotNull(message = "Leave Slip ID must be provided")
        Long id,
        @JsonProperty(required = true)
        @NotNull(message = "User ID must be provided")
        Long userId,
        @JsonProperty(required = true)
        @Future(message = "Date cannot be in the past/today")
        Instant startTime,
        @JsonProperty(required = true)
        @Future(message = "Date cannot be in the past/today")
        Instant endTime,
        @JsonProperty(required = true)
        @NotBlank(message = "Description must be provided")
        String description
) {
}
