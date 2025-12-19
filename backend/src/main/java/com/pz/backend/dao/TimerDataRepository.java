package com.pz.backend.dao;

import com.pz.backend.entity.TimerData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimerDataRepository extends JpaRepository<TimerData, Long> {
}
