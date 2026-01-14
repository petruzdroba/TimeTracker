package com.pz.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TimerType {
    ON, OFF;

    @JsonCreator
    public static TimerType fromString(String value) {
        return Arrays.stream(TimerType.values())
                .filter(r -> r.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid timer type: " + value));
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}
