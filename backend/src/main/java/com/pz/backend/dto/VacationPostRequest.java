package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pz.backend.entity.Status;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record VacationPostRequest(
        @NotNull(message = "User ID must be provided")
        @JsonProperty(required = true)
        Long userId,
        @NotNull(message = "Date must be provided")
        @Future(message = "Date cannot be in the past/today")
        @JsonProperty(required = true)
        Instant startDate,
        @NotNull(message = "Date must be provided")
        @Future(message = "Date cannot be in the past/today")
        @JsonProperty(required = true)
        Instant endDate,
        @NotBlank(message = "Description must be provided")
        @JsonProperty(required = true)
        String description
){ }
