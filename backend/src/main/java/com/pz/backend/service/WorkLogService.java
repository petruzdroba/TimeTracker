package com.pz.backend.service;

import com.pz.backend.dto.WorkLogPayload;
import com.pz.backend.entity.WorkLog;

import java.util.List;

public interface WorkLogService {
    WorkLog get(Long workLogId) throws Exception;

    WorkLog put(Long userId, List<WorkLogPayload> data) throws Exception;
}
