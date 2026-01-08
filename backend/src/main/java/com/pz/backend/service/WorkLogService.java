package com.pz.backend.service;

import com.pz.backend.entity.WorkLog;

public interface WorkLogService {
    public WorkLog get(Long workLogId) throws Exception;
}
