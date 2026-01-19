package com.pz.backend.service;

import com.pz.backend.dao.UserDataRepository;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.NotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserDataRepository userDataRepository;

    public UserServiceImpl(UserDataRepository userDataRepository) {
        this.userDataRepository = userDataRepository;
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
}
