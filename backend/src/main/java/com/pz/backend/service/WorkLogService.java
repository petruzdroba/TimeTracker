package com.pz.backend.service;

import com.pz.backend.entity.WorkLog;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkLogService {
    WorkLog post(Long userId, LocalDateTime date, Long timeWorked) throws AlreadyExistsException;

    List<WorkLog> get(Long userId) throws Exception;

    WorkLog put(Long workLogId, Long timeWorked) throws NotFoundException;

    void delete(Long workLogId) throws NotFoundException;

    WorkLog findById(Long workLogId) throws NotFoundException;
}
