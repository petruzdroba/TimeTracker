package com.pz.backend.dto;

import java.util.List;

public record WorkLogRequest(Long userId, List<WorkLogPayload> data) {}
