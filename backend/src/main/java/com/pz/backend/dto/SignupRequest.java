package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignupRequest(
        @NotBlank
        @JsonProperty(required = true)
        String name,
        @NotBlank
        @JsonProperty(required = true)
        @Email(message = "Email must be valid")
        String email,
        @NotBlank
        @JsonProperty(required = true)
        String password) {
}
