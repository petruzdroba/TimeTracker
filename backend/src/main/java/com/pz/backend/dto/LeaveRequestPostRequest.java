package com.pz.backend.dto;

import java.time.Instant;

public record LeaveRequestPostRequest(
        Long userId,
        Instant startTime,
        Instant endTime,
        String description
) {
}
