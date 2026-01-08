package com.pz.backend.dto;

public record TimerDataPayload(
        String startTime,
        String endTime,
        Integer requiredTime,
        String timerType
) {}
