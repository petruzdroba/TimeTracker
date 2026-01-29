package com.pz.backend.service;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.entity.LeaveRequest;
import com.pz.backend.entity.Status;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InsufficientPersonalTimeException;
import com.pz.backend.exceptions.NotFoundException;

import java.time.Instant;
import java.util.List;

public interface LeaveRequestService {

    LeaveRequest findById(Long id) throws NotFoundException;

    List<LeaveRequest> get(Long userId) throws NotFoundException;

    List<LeaveRequest> get();

    List<LeaveRequest> get(Status status);

    List<LeaveRequest> get(Long userId, TimeRelation timeRelation);

    Long getRemaining(Long userId) throws NotFoundException;

    LeaveRequest post(Long userId, Instant startTime, Instant endTime, String description) throws AlreadyExistsException, InsufficientPersonalTimeException;

    LeaveRequest put(Long id, Long userId, Instant startTime, Instant endTime, String description) throws NotFoundException, InsufficientPersonalTimeException;

    LeaveRequest put(Long id, Status status) throws NotFoundException;

    void delete(Long id) throws NotFoundException;
}
