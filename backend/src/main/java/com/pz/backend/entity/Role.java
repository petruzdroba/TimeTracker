package com.pz.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum Role {
    EMPLOYEE, MANAGER, ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        return Arrays.stream(Role.values())
                .filter(r -> r.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + value));
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}
