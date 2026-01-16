package com.pz.backend.service;

import com.pz.backend.entity.Vacation;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;

import java.time.Instant;
import java.util.List;

public interface VacationService {

    Vacation post(Long userId, Instant startDate, Instant endDate, String description) throws AlreadyExistsException;

    List<Vacation> get(Long userId);

    Vacation put(Long id, Long userId, Instant startDate, Instant endDate, String description) throws NotFoundException;

    Vacation findById(Long id) throws NotFoundException;

    void delete(Long id) throws NotFoundException;
}
