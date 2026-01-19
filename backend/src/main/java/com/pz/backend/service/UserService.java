package com.pz.backend.service;

import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.NotFoundException;

public interface UserService {

    UserData findById(Long id) throws NotFoundException;

    UserData findByEmail(String email) throws NotFoundException;

}
