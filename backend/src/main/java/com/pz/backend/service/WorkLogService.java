package com.pz.backend.service;

import com.pz.backend.entity.WorkLog;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkLogService {
    WorkLog post(Long userId, LocalDateTime date, Long timeWorked) throws Exception;

    List<WorkLog> get(Long userId) throws Exception;

    WorkLog put(Long workLogId, Long timeWorked) throws Exception;

    void delete(Long workLogId) throws Exception;

    WorkLog findById(Long workLogId) throws Exception;
}
