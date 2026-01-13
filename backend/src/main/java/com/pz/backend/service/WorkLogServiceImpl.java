package com.pz.backend.service;


import com.pz.backend.dao.WorkLogRepository;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.WorkLog;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public WorkLogServiceImpl(WorkLogRepository workLogRepository) {
        this.workLogRepository = workLogRepository;
    }

    @Override
    @Transactional
    public WorkLog post(Long userId, Instant date, Long timeWorked) throws AlreadyExistsException {
        WorkLog existing = workLogRepository.findByUserIdAndDate(userId, date);

        if (existing != null) {
            throw new AlreadyExistsException("Work log for this date already exists");
        }

        UserAuth auth = entityManager.getReference(UserAuth.class, userId);

        WorkLog newLog = new WorkLog();
        newLog.setUser(auth);
        newLog.setDate(date);
        newLog.setTimeWorked(timeWorked);
        return workLogRepository.save(newLog);
    }

    @Override
    public List<WorkLog> get(Long userId) throws Exception {
        return workLogRepository.findAllByUserId(userId);
    }

    @Override
    @Transactional
    public WorkLog put(Long workLogId, Instant date, Long timeWorked) throws NotFoundException {
        WorkLog existing = workLogRepository.findById(workLogId).orElseThrow(() -> new NotFoundException(WorkLog.class.getName(), workLogId));

        existing.setTimeWorked(timeWorked);
        existing.setDate(date);
        return workLogRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long workLogId) throws NotFoundException {
        if (!workLogRepository.existsById(workLogId)) {
            throw new NotFoundException(WorkLog.class.getName(), workLogId);
        }
        workLogRepository.deleteById(workLogId);
    }

    @Override
    public WorkLog findById(Long workLogId) throws NotFoundException {
        return workLogRepository.findById(workLogId)
                .orElseThrow(() -> new NotFoundException(WorkLog.class.getName(), workLogId));
    }
}
