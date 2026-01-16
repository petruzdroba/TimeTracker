package com.pz.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum Status {
    PENDING, ACCEPTED, DENIED, IGNORED;

    @JsonCreator
    public static Status fromString(String value) {
        return Arrays.stream(Status.values())
                .filter(r -> r.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + value));
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}
