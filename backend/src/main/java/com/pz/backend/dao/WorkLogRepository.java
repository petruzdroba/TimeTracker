package com.pz.backend.dao;

import com.pz.backend.entity.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    List<WorkLog> findAllByUserId(Long userId);

    WorkLog findByUserIdAndDate(Long userId, LocalDate date);

    void deleteByUserIdAndDate(Long userId, LocalDate date);
}
