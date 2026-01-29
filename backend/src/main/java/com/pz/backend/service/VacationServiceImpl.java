package com.pz.backend.service;

import com.pz.backend.common.TimeRelation;
import com.pz.backend.dao.VacationRepository;
import com.pz.backend.entity.Status;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import com.pz.backend.entity.Vacation;
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
public class VacationServiceImpl implements VacationService {

    private final VacationRepository vacationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public VacationServiceImpl(VacationRepository vacationRepository) {
        this.vacationRepository = vacationRepository;
    }

    @Override
    @Transactional
    public List<Vacation> get(Long userId) throws NotFoundException {
        vacationRepository.updateExpiredVacationsToIgnored(Instant.now());
        return vacationRepository.findAllByUser_Id(userId);
    }

    @Override
    public Vacation findById(Long id) throws NotFoundException {
        return vacationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Vacation.class.getName(), id));
    }

    @Override
    @Transactional
    public List<Vacation> getStatus(Status status) {
        vacationRepository.updateExpiredVacationsToIgnored(Instant.now());
        return vacationRepository.findAllByStatus(status);
    }

    @Override
    @Transactional
    public List<Vacation> getAll() {
        vacationRepository.updateExpiredVacationsToIgnored(Instant.now());
        return vacationRepository.findAll();
    }

    @Override
    public Long getRemainingDays(Long userId) throws NotFoundException {
        UserData user = entityManager.find(UserData.class, userId);
        if (user == null) {
            throw new NotFoundException(UserData.class.getName(), userId);
        }

        int currentYear = LocalDate.now(ZoneId.systemDefault()).getYear();

        int totalTakenThisYear = vacationRepository.findAllByUser_Id(userId).stream()
                .filter(v -> v.getStatus() == Status.ACCEPTED)
                .filter(v -> v.getStartDate()
                        .atZone(ZoneId.systemDefault())
                        .getYear() == currentYear)
                .mapToInt(v -> getDaysBetweenDates(v.getStartDate(), v.getEndDate()))
                .sum();

        return (long) (user.getVacationDays() - totalTakenThisYear);
    }

    @Override
    public List<Vacation> getVacationsByTimeRelation(Long userId, TimeRelation timeRelation) {
        Instant now = Instant.now();

        return vacationRepository.findAllByUser_Id(userId).stream()
                .filter(vacation -> {
                    Instant start = vacation.getStartDate();
                    return switch (timeRelation) {
                        case PAST -> !start.isAfter(now);
                        case FUTURE -> start.isAfter(now);
                    };
                })
                .toList();
    }

    @Override
    @Transactional
    public Vacation post(Long userId, Instant startDate, Instant endDate, String description)
            throws AlreadyExistsException, InsufficientVacationDaysException {

        Vacation existing = vacationRepository.findByUser_IdAndStartDate(userId, startDate);

        if (existing != null) {
            throw new AlreadyExistsException("Vacation for this day already exists");
        }

        int requestedDays = getDaysBetweenDates(startDate, endDate);
        long remainingDays = getRemainingDays(userId);

        if (requestedDays > remainingDays) {
            throw new InsufficientVacationDaysException(
                    "Not enough remaining vacation days"
            );
        }

        UserAuth auth = entityManager.getReference(UserAuth.class, userId);
        Vacation vacation = new Vacation(auth, startDate, endDate, description);

        return vacationRepository.save(vacation);
    }

    @Override
    @Transactional
    public Vacation put(Long id, Long userId, Instant startDate, Instant endDate, String description)
            throws NotFoundException, InsufficientPersonalTimeException {

        int requestedDays = getDaysBetweenDates(startDate, endDate);
        long remainingDays = getRemainingDays(userId);

        if (requestedDays > remainingDays) {
            throw new InsufficientVacationDaysException(
                    "Not enough remaining vacation days"
            );
        }

        Vacation existing = vacationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Vacation.class.getName(), id));

        existing.setStartDate(startDate);
        existing.setEndDate(endDate);
        existing.setDescription(description);
        existing.setStatus(Status.PENDING);

        return vacationRepository.save(existing);
    }

    @Override
    @Transactional
    public Vacation updateStatus(Long id, Status status) throws NotFoundException {
        Vacation existing = vacationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Vacation.class.getName(), id));

        existing.setStatus(status);
        return vacationRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) throws NotFoundException {
        if (!vacationRepository.existsById(id)) {
            throw new NotFoundException(Vacation.class.getName(), id);
        }

        vacationRepository.deleteById(id);
    }

    private static int getDaysBetweenDates(Instant start, Instant end) {
        int count = 0;
        ZonedDateTime current = start.atZone(ZoneId.systemDefault());
        ZonedDateTime endDate = end.atZone(ZoneId.systemDefault());

        while (!current.toLocalDate().isAfter(endDate.toLocalDate())) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
            current = current.plusDays(1);
        }

        return count;
    }
}
