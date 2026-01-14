package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.Instant;

public record WorkLogPutRequest(
        @NotNull(message = "Work log ID must be provided")
        @JsonProperty(required = true)
        Long id,
        @NotNull(message = "User ID must be provided")
        @JsonProperty(required = true)
        Long userId,
        @NotNull(message = "Date must be provided")
        @Past(message = "Date cannot be in the future/today")
        @JsonProperty(required = true)
        Instant date,
        @NotNull(message = "Time worked must be provided")
        @JsonProperty(required = true)
        Long timeWorked) {
}
