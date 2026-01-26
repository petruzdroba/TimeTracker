package com.pz.backend.dto;

import java.time.Instant;

public record LeaveRequestPutRequest(
        Long id,
        Long userId,
        Instant startTime,
        Instant endTime,
        String description
) {
}
