package com.pz.backend.service;

import com.pz.backend.dao.VacationRepository;
import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.Vacation;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.NotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
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
    public Vacation post(Long userId, Instant startDate, Instant endDate, String description) throws AlreadyExistsException {
        Vacation existing = vacationRepository.findByUserIdAndStartDate(userId, startDate);

        if (existing != null) {
            throw new AlreadyExistsException("Vacation for this day already exists");
        }

        UserAuth auth = entityManager.getReference(UserAuth.class, userId);
        Vacation vacation = new Vacation(auth, startDate, endDate, description);

        return vacationRepository.save(vacation);
    }

    @Override
    public List<Vacation> get(Long userId) {
        return vacationRepository.findAllByUserId(userId);
    }

    @Override
    @Transactional
    public Vacation put(Long id, Long userId, Instant startDate, Instant endDate, String description) throws NotFoundException {
        Vacation existing = vacationRepository.findById(id).orElseThrow(() -> new NotFoundException(Vacation.class.getName(), id));

        existing.setStartDate(startDate);
        existing.setEndDate(endDate);
        existing.setDescription(description);

        return vacationRepository.save(existing);
    }

    @Override
    public Vacation findById(Long id) throws NotFoundException {
        return vacationRepository.findById(id).orElseThrow(() -> new NotFoundException(Vacation.class.getName(), id));
    }

    @Override
    @Transactional
    public void delete(Long id) throws NotFoundException {
        if(!vacationRepository.existsById(id)){
            throw new NotFoundException(Vacation.class.getName(), id);
        }

        vacationRepository.deleteById(id);
    }
}
