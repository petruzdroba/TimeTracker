package com.pz.backend.service;

import com.pz.backend.dao.UserDataRepository;
import com.pz.backend.entity.Role;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.NotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserDataRepository userDataRepository;

    public UserServiceImpl(UserDataRepository userDataRepository) {
        this.userDataRepository = userDataRepository;
    }

    @Override
    public List<UserData> get() {
        return userDataRepository.findAll();
    }

    @Override
    public UserData findById(Long id) throws NotFoundException {
        return userDataRepository.findById(id)
                .orElseThrow(()-> new NotFoundException(UserData.class.getName(), id));
    }

    @Override
    public UserData findByEmail(String email) throws NotFoundException {
        return userDataRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException(UserData.class.getName(), email));
    }

    @Transactional
    @Override
    public UserData put(Long id, String name, String email, int workHours, int vacationDays, int personalTime, Role role) throws NotFoundException {
        UserData existing = userDataRepository.findById(id)
                .orElseThrow(()-> new NotFoundException(UserData.class.getName(), id));

        existing.setName(name);
        existing.setEmail(email);
        existing.setWorkHours(workHours);
        existing.setVacationDays(vacationDays);
        existing.setPersonalTime(personalTime);
        existing.setRole(role);

        return userDataRepository.save(existing);
    }
}
