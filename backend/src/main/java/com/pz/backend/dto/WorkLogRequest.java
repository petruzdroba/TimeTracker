package com.pz.backend.dto;

import java.time.LocalDate;

public record WorkLogRequest(Long workLogId, Long userId, LocalDate date, long timeWorked) {
}
