package com.pz.backend.service;

import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;
import com.pz.backend.exceptions.AlreadyExistsException;
import com.pz.backend.exceptions.InvalidCredentialsException;
import com.pz.backend.exceptions.NotFoundException;

public interface AuthService {
    UserData signUp(String name, String email, String password) throws AlreadyExistsException;

    UserAuth logIn(String email, String password) throws NotFoundException, InvalidCredentialsException;

    UserData getMe(Long userId) throws NotFoundException;
}
