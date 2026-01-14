package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TimerDataPutRequest(
        @NotNull
        @JsonProperty(required = true)
        Long userId,
        @NotBlank
        @Pattern(
                regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                message = "startTime must be in ISO 8601 format, e.g., 2026-01-13T12:34:56.789Z"
        )
        @JsonProperty(required = true)
        String startTime,
        @NotBlank
        @Pattern(
                regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$",
                message = "endTime must be in ISO 8601 format, e.g., 2026-01-13T12:34:56.789Z"
        )
        @JsonProperty(required = true)
        String endTime,
        @NotNull
        @JsonProperty(required = true)
        Integer requiredTime,
        @NotBlank
        @JsonProperty(required = true)
        String timerType
) {
}
