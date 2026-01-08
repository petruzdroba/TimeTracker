package com.pz.backend.service;


import com.pz.backend.dao.WorkLogRepository;
import com.pz.backend.entity.WorkLog;
import org.springframework.stereotype.Service;

@Service
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;

    public WorkLogServiceImpl(WorkLogRepository workLogRepository) {
        this.workLogRepository = workLogRepository;
    }

    @Override
    public WorkLog get(Long workLogId) throws Exception {
        return workLogRepository.findById(workLogId).orElseThrow(() -> new Exception("Work Log not found"));
    }

    @Override
    public WorkLog put(Long userId, String workLog) throws Exception {
        WorkLog existing = workLogRepository.findById(userId)
                .orElseThrow(() -> new Exception("Work log not found"));

        existing.setWorkLog(workLog);
        return workLogRepository.save(existing);
    }
}
