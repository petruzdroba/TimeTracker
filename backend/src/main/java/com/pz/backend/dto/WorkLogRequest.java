package com.pz.backend.dto;

import java.time.LocalDateTime;

public record WorkLogRequest(Long workLogId, Long userId, LocalDateTime date, long timeWorked) {
}
