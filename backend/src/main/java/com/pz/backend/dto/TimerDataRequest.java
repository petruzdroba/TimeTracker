package com.pz.backend.dto;

public record TimerDataRequest(
        Long userId,
        TimerDataPayload data
) {}

