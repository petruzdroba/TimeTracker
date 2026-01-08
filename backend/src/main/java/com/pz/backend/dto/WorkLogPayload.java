package com.pz.backend.dto;

import java.time.Instant;

public record WorkLogPayload(
        Instant date,
        long timeWorked
) {}
