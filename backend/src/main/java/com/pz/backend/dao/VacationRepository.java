package com.pz.backend.dao;

import com.pz.backend.entity.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {
    List<Vacation> findAllByUserId(Long userId);

    Vacation findByUserIdAndStartDate(Long userId, Instant startDate);
}
