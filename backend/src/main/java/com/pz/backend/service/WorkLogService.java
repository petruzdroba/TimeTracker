package com.pz.backend.service;

import com.pz.backend.entity.WorkLog;

public interface WorkLogService {
    WorkLog get(Long workLogId) throws Exception;

    WorkLog put(Long userId, String workLog) throws Exception;
}
