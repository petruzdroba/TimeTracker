package com.pz.backend.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pz.backend.dao.WorkLogRepository;
import com.pz.backend.dto.WorkLogPayload;
import com.pz.backend.entity.WorkLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    @Autowired
    ObjectMapper mapper;

    public WorkLogServiceImpl(WorkLogRepository workLogRepository) {
        this.workLogRepository = workLogRepository;
    }

    @Override
    public WorkLog get(Long workLogId) throws Exception {
        return workLogRepository.findById(workLogId).orElseThrow(() -> new Exception("Work Log not found"));
    }

    @Override
    public WorkLog put(Long userId, List<WorkLogPayload> data)throws Exception {
        WorkLog existing = workLogRepository.findById(userId)
                .orElseThrow(() -> new Exception("Work log not found"));

        existing.setWorkLog(mapper.writeValueAsString(data));
        return workLogRepository.save(existing);
    }
}
