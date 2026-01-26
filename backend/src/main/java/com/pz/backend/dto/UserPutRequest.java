package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pz.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserPutRequest(
        @NotNull(message = "User ID must be provided")
        @JsonProperty(required = true)
        Long id,
        @NotBlank
        @JsonProperty(required = true)
        String name,
        @NotBlank
        @JsonProperty(required = true)
        @Email(message = "Email must be valid")
        String email,
        @NotNull
        @Min(0)
        @Max(12)
        Integer workHours,
        @NotNull
        @Min(1)
        @Max(365)
        Integer vacationDays,
        @NotNull
        @Min(1)
        @Max(480)
        Integer personalTime,
        @NotNull
        @JsonProperty(required = true)
        Role role
) { }
