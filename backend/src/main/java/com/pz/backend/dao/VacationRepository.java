package com.pz.backend.dao;

import com.pz.backend.entity.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacationRepository extends JpaRepository<Vacation, Long> {

}
