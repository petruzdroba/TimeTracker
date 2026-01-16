package com.pz.backend.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.pz.backend.entity.Status;

import java.util.Arrays;

public enum TimeRelation {
    FUTURE, PAST;

    @JsonCreator
    public static TimeRelation fromString(String value) {
        return Arrays.stream(TimeRelation.values())
                .filter(r -> r.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid relaton: " + value));
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}
