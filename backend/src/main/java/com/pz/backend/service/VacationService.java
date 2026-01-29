package com.pz.backend.service;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.entity.Status;
import com.pz.backend.entity.Vacation;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InsufficientVacationDaysException;
import com.pz.backend.exceptions.NotFoundException;

import java.time.Instant;
import java.util.List;

public interface VacationService {

    Vacation post(Long userId, Instant startDate, Instant endDate, String description) throws AlreadyExistsException, InsufficientVacationDaysException;

    List<Vacation> get(Long userId) throws NotFoundException;

    Vacation put(Long id, Long userId, Instant startDate, Instant endDate, String description) throws NotFoundException, InsufficientVacationDaysException;

    Vacation findById(Long id) throws NotFoundException;

    void delete(Long id) throws NotFoundException;

    Vacation updateStatus(Long id, Status status) throws NotFoundException;

    List<Vacation> getStatus(Status status);

    List<Vacation> getAll();

    Long getRemainingDays(Long userId) throws NotFoundException;

    List<Vacation> getVacationsByTimeRelation(Long userId, TimeRelation timeRelation);
}
