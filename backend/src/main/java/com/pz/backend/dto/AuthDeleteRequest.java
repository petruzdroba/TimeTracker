package com.pz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record AuthDeleteRequest(
        @NotBlank
        @JsonProperty(required = true)
        String password) {
}
