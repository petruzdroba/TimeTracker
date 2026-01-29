package com.pz.backend.service;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.dao.LeaveRequestRepository;
import com.pz.backend.entity.LeaveRequest;
import com.pz.backend.entity.Status;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InsufficientPersonalTimeException;
import com.pz.backend.exceptions.InsufficientVacationDaysException;
import com.pz.backend.exceptions.NotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository repository;

    @PersistenceContext
    private EntityManager entityManager;

    public LeaveRequestServiceImpl(LeaveRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    public LeaveRequest findById(Long id) throws NotFoundException {
        return repository.findById(id).orElseThrow(() -> new NotFoundException(LeaveRequest.class.getName(), id));
    }

    @Override
    public List<LeaveRequest> get(Long userId) throws NotFoundException {
        return repository.findAllByUser_Id(userId);
    }

    @Override
    public List<LeaveRequest> get() {
        return repository.findAll();
    }

    @Override
    public List<LeaveRequest> get(Status status) {
        return repository.findAllByStatus(status);
    }

    @Override
    public List<LeaveRequest> get(Long userId, TimeRelation timeRelation) {
        Instant now = Instant.now();

        return repository.findAllByUser_Id(userId).stream()
                .filter(leaveRequest -> {
                    Instant start = leaveRequest.getStartTime();
                    return switch (timeRelation) {
                        case PAST -> !start.isAfter(now);
                        case FUTURE -> start.isAfter(now);
                    };
                }).toList();
    }

    @Override
    public Long getRemaining(Long userId) throws NotFoundException {
        UserData user = entityManager.getReference(UserData.class, userId);
        if (user == null)
            throw new NotFoundException(UserData.class.getName(), userId);

        int currentYear = LocalDateTime.now(ZoneId.systemDefault()).getYear();

        double totalTaken = repository.findAllByUser_Id(userId).stream()
                .filter(leaveRequest -> leaveRequest.getStatus().equals(Status.ACCEPTED))
                .filter(leaveRequest -> leaveRequest.getStartTime().atZone(ZoneId.systemDefault()).getYear() == currentYear)
                .mapToDouble(leaveRequest -> getHoursBetweenTimes(leaveRequest.getStartTime(), leaveRequest.getEndTime()))
                .sum();

        return (long) (user.getPersonalTime() - totalTaken);
    }

    @Override
    @Transactional
    public LeaveRequest post(Long userId, Instant startTime, Instant endTime, String description) throws AlreadyExistsException, InsufficientVacationDaysException {

        LeaveRequest existing = repository.findByUser_IdAndStartTime(userId, startTime);

        if (existing != null)
            throw new AlreadyExistsException("Leave request for this time already exists");

        double requestedTime = getHoursBetweenTimes(startTime, endTime);
        long takenTime = getRemaining(userId);

        if (requestedTime > takenTime)
            throw new InsufficientPersonalTimeException("Not enough personal time left");

        return null;
    }

    @Override
    @Transactional
    public LeaveRequest put(Long id, Long userId, Instant startTime, Instant endTime, String description) throws NotFoundException, InsufficientPersonalTimeException {

        double requestedTime = getHoursBetweenTimes(startTime, endTime);
        long takenTime = getRemaining(userId);

        if (requestedTime > takenTime)
            throw new InsufficientPersonalTimeException("Not enough personal time left");

        LeaveRequest existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(LeaveRequest.class.getName(), id));

        existing.setStartTime(startTime);
        existing.setEndTime(endTime);
        existing.setDescription(description);
        existing.setStatus(Status.PENDING);

        return repository.save(existing);
    }

    @Override
    @Transactional
    public LeaveRequest put(Long id, Status status) throws NotFoundException {

        LeaveRequest existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(LeaveRequest.class.getName(), id));

        existing.setStatus(status);

        return repository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) throws NotFoundException {
        if(!repository.existsById(id))
            throw new NotFoundException(LeaveRequest.class.getName(), id);

        repository.deleteById(id);
    }

    private static double getHoursBetweenTimes(Instant startTime, Instant endTime) {
        ZonedDateTime start = startTime.atZone(ZoneId.systemDefault());
        ZonedDateTime end = endTime.atZone(ZoneId.systemDefault());

        Duration duration = Duration.between(start, end);

        return duration.toHours() + (duration.toMinutesPart() / 60.0);
    }
}
