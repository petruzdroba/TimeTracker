package com.pz.backend.service;

import com.pz.backend.entity.UserAuth;
import com.pz.backend.entity.UserData;

public interface AuthService {
    public UserData signUp(String name, String email, String password) throws Exception;

    public UserAuth logIn(String email, String password) throws Exception;
}
