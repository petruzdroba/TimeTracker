package com.pz.backend.dao;

import com.pz.backend.entity.LeaveRequest;
import com.pz.backend.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findAllByUser_Id(Long userId);

    LeaveRequest findByUser_IdAndStartTime(Long userId, Instant startTime);

    List<LeaveRequest> findAllByStatus(Status status);

    @Modifying
    @Query("UPDATE LeaveRequest req SET req.status = 'IGNORED' " +
            "WHERE req.startTime < :now " +
            "AND reeq.status IN ('PENDING', 'ACCEPTED', 'DENIED')")
    void updateLeaveRequestsToIgnored(@Param("now") Instant now);
}
