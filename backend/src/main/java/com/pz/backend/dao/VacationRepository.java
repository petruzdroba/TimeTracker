package com.pz.backend.dao;

import com.pz.backend.entity.Status;
import com.pz.backend.entity.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {
    List<Vacation> findAllByUser_Id(Long userId);

    Vacation findByUser_IdAndStartDate(Long userId, Instant startDate);

    List<Vacation> findAllByStatus(Status status);

    @Modifying
    @Query("UPDATE Vacation v SET v.status = 'IGNORED' " +
            "WHERE v.startDate < :now " +
            "AND v.status IN ('PENDING', 'ACCEPTED', 'DENIED')")
    int updateExpiredVacationsToIgnored(@Param("now") Instant now);
}
